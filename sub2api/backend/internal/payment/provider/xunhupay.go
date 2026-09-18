package provider

import (
	"context"
	"crypto/hmac"
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/Wei-Shaw/sub2api/internal/payment"
)

const (
	xunhupayDefaultAPIBase     = "https://api.xunhupay.com"
	xunhupayAPIVersion         = "1.1"
	xunhupayHTTPTimeout        = 15 * time.Second
	xunhupayMaxResponseSize    = 1 << 20
	xunhupayMaxErrorSummary    = 512
	xunhupayStatusPaid         = "OD"
	xunhupayStatusPending      = "WP"
	xunhupayStatusCancelled    = "CD"
	xunhupayStatusRefunding    = "RD"
	xunhupayStatusRefundFailed = "UD"
	xunhupayPlugins            = "sub2api"
)

type XunHuPay struct {
	instanceID string
	config     map[string]string
	httpClient *http.Client
	now        func() time.Time
	nonce      func() string
}

func NewXunHuPay(instanceID string, config map[string]string) (*XunHuPay, error) {
	for _, k := range []string{"appId", "appSecret"} {
		if strings.TrimSpace(config[k]) == "" {
			return nil, fmt.Errorf("xunhupay config missing required key: %s", k)
		}
	}
	cfg := cloneStringMap(config)
	apiBase, err := normalizeXunHuPayAPIBase(cfg["apiBase"])
	if err != nil {
		return nil, err
	}
	cfg["apiBase"] = apiBase
	return &XunHuPay{
		instanceID: instanceID,
		config:     cfg,
		httpClient: &http.Client{Timeout: xunhupayHTTPTimeout},
		now:        time.Now,
		nonce:      randomXunHuPayNonce,
	}, nil
}

func normalizeXunHuPayAPIBase(apiBase string) (string, error) {
	base := strings.TrimSpace(apiBase)
	if base == "" {
		return xunhupayDefaultAPIBase, nil
	}
	parsed, err := url.Parse(base)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return "", fmt.Errorf("xunhupay config apiBase is invalid")
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return "", fmt.Errorf("xunhupay config apiBase must use http or https")
	}
	parsed.RawQuery = ""
	parsed.Fragment = ""
	parsed.RawPath = ""
	parsed.Path = trimXunHuPayEndpointPath(parsed.Path)
	return strings.TrimRight(parsed.String(), "/"), nil
}

func trimXunHuPayEndpointPath(path string) string {
	path = strings.TrimRight(strings.TrimSpace(path), "/")
	lower := strings.ToLower(path)
	for _, endpoint := range []string{"/payment/do.html", "/payment/query.html", "/payment/refund.html"} {
		if strings.HasSuffix(lower, endpoint) {
			return strings.TrimRight(path[:len(path)-len(endpoint)], "/")
		}
	}
	return path
}

func (x *XunHuPay) apiBase() string {
	if x == nil {
		return xunhupayDefaultAPIBase
	}
	if base := strings.TrimSpace(x.config["apiBase"]); base != "" {
		return base
	}
	return xunhupayDefaultAPIBase
}

func (x *XunHuPay) Name() string        { return "XunHuPay" }
func (x *XunHuPay) ProviderKey() string { return payment.TypeXunHuPay }
func (x *XunHuPay) SupportedTypes() []payment.PaymentType {
	return []payment.PaymentType{payment.TypeAlipay, payment.TypeWxpay}
}

func (x *XunHuPay) MerchantIdentityMetadata() map[string]string {
	if x == nil {
		return nil
	}
	appID := strings.TrimSpace(x.config["appId"])
	if appID == "" {
		return nil
	}
	return map[string]string{"appid": appID}
}

func (x *XunHuPay) CreatePayment(ctx context.Context, req payment.CreatePaymentRequest) (*payment.CreatePaymentResponse, error) {
	notifyURL, returnURL := x.resolveURLs(req)
	params := map[string]string{
		"version":        xunhupayAPIVersion,
		"appid":          strings.TrimSpace(x.config["appId"]),
		"trade_order_id": strings.TrimSpace(req.OrderID),
		"total_fee":      strings.TrimSpace(req.Amount),
		"title":          strings.TrimSpace(req.Subject),
		"notify_url":     notifyURL,
		"plugins":        xunhupayPlugins,
	}
	if returnURL != "" {
		params["return_url"] = returnURL
	}
	body, err := x.post(ctx, x.apiBase()+"/payment/do.html", params)
	if err != nil {
		return nil, fmt.Errorf("xunhupay create: %w", err)
	}

	var resp xunhupayAPIResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("xunhupay parse create: %w", err)
	}
	if err := resp.err("create"); err != nil {
		return nil, err
	}

	payURL := strings.TrimSpace(resp.URL)
	qrCodeImg := strings.TrimSpace(resp.URLQrcode)
	tradeNo := firstNonEmpty(resp.OpenOrderID, strconv.FormatInt(resp.OpenID, 10))
	if payURL == "" && qrCodeImg == "" {
		return nil, fmt.Errorf("xunhupay create returned empty payment url")
	}
	// Official docs: do not show url_qrcode and then jump to url.
	// Desktop uses the ready-made QR image; mobile/popup uses the cashier URL.
	if req.IsMobile || strings.EqualFold(strings.TrimSpace(x.config["paymentMode"]), "popup") {
		qrCodeImg = ""
	} else {
		payURL = ""
	}
	if payURL == "" && qrCodeImg == "" {
		return nil, fmt.Errorf("xunhupay create returned empty payment url")
	}
	return &payment.CreatePaymentResponse{
		TradeNo:   tradeNo,
		PayURL:    payURL,
		QRCodeImg: qrCodeImg,
	}, nil
}

func (x *XunHuPay) QueryOrder(ctx context.Context, tradeNo string) (*payment.QueryOrderResponse, error) {
	tradeNo = strings.TrimSpace(tradeNo)
	if tradeNo == "" {
		return nil, fmt.Errorf("xunhupay query missing order identifier")
	}
	params := map[string]string{
		"appid":           strings.TrimSpace(x.config["appId"]),
		"out_trade_order": tradeNo,
	}
	body, err := x.post(ctx, x.apiBase()+"/payment/query.html", params)
	if err != nil {
		return nil, fmt.Errorf("xunhupay query: %w", err)
	}

	var resp xunhupayAPIResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("xunhupay parse query: %w", err)
	}
	if err := resp.err("query"); err != nil {
		return nil, err
	}

	status := mapXunHuPayOrderStatus(resp.Data.Status)
	amount, _ := strconv.ParseFloat(strings.TrimSpace(resp.Data.TotalAmount), 64)
	responseTradeNo := firstNonEmpty(resp.Data.TransactionID, resp.Data.OpenOrderID, tradeNo)
	return &payment.QueryOrderResponse{
		TradeNo:  responseTradeNo,
		Status:   status,
		Amount:   amount,
		PaidAt:   strings.TrimSpace(resp.Data.PaidDate),
		Metadata: x.MerchantIdentityMetadata(),
	}, nil
}

func (x *XunHuPay) VerifyNotification(_ context.Context, rawBody string, _ map[string]string) (*payment.PaymentNotification, error) {
	params, err := parseXunHuPayNotifyBody(rawBody)
	if err != nil {
		return nil, err
	}
	hash := params["hash"]
	if hash == "" {
		return nil, fmt.Errorf("missing hash")
	}
	if !xunhupayVerifyHash(params, x.config["appSecret"], hash) {
		return nil, fmt.Errorf("invalid signature")
	}

	status := payment.ProviderStatusFailed
	switch strings.ToUpper(strings.TrimSpace(params["status"])) {
	case xunhupayStatusPaid:
		status = payment.ProviderStatusSuccess
	case xunhupayStatusRefunding, xunhupayStatusCancelled:
		status = payment.ProviderStatusFailed
	}
	amount, _ := strconv.ParseFloat(strings.TrimSpace(params["total_fee"]), 64)

	metadata := x.MerchantIdentityMetadata()
	if appID := strings.TrimSpace(params["appid"]); appID != "" {
		if metadata == nil {
			metadata = map[string]string{}
		}
		metadata["appid"] = appID
	}
	return &payment.PaymentNotification{
		TradeNo:  firstNonEmpty(params["transaction_id"], params["open_order_id"]),
		OrderID:  strings.TrimSpace(params["trade_order_id"]),
		Amount:   amount,
		Status:   status,
		RawData:  rawBody,
		Metadata: metadata,
	}, nil
}

func (x *XunHuPay) Refund(ctx context.Context, req payment.RefundRequest) (*payment.RefundResponse, error) {
	attempts := x.refundAttempts(req)
	if len(attempts) == 0 {
		return nil, fmt.Errorf("xunhupay refund missing order identifier")
	}
	var firstErr error
	for i, attempt := range attempts {
		body, err := x.post(ctx, x.apiBase()+"/payment/refund.html", attempt.params)
		if err != nil {
			return nil, fmt.Errorf("xunhupay refund request: %w", err)
		}
		var resp xunhupayAPIResponse
		if err := json.Unmarshal(body, &resp); err != nil {
			return nil, fmt.Errorf("xunhupay parse refund: %w", err)
		}
		if err := resp.err("refund"); err != nil {
			if firstErr == nil {
				firstErr = err
			}
			if i+1 < len(attempts) && isXunHuPayRefundOrderNotFound(err) {
				continue
			}
			return nil, err
		}
		status := payment.ProviderStatusSuccess
		switch strings.ToUpper(strings.TrimSpace(resp.RefundStatus)) {
		case xunhupayStatusRefunding:
			status = payment.ProviderStatusPending
		case xunhupayStatusRefundFailed, xunhupayStatusPaid:
			status = payment.ProviderStatusFailed
		case xunhupayStatusCancelled:
			status = payment.ProviderStatusSuccess
		}
		refundID := firstNonEmpty(resp.OutRefundNo, attempt.refundID)
		return &payment.RefundResponse{RefundID: refundID, Status: status}, nil
	}
	return nil, firstErr
}

type xunhupayRefundAttempt struct {
	params   map[string]string
	refundID string
}

func (x *XunHuPay) refundAttempts(req payment.RefundRequest) []xunhupayRefundAttempt {
	base := map[string]string{
		"appid": strings.TrimSpace(x.config["appId"]),
	}
	if reason := strings.TrimSpace(req.Reason); reason != "" {
		base["reason"] = reason
	}
	var attempts []xunhupayRefundAttempt
	if orderID := strings.TrimSpace(req.OrderID); orderID != "" {
		params := cloneStringMap(base)
		params["trade_order_id"] = orderID
		attempts = append(attempts, xunhupayRefundAttempt{params: params, refundID: orderID})
	}
	if tradeNo := strings.TrimSpace(req.TradeNo); tradeNo != "" {
		params := cloneStringMap(base)
		params["open_order_id"] = tradeNo
		attempts = append(attempts, xunhupayRefundAttempt{params: params, refundID: tradeNo})
	}
	return attempts
}

func (x *XunHuPay) resolveURLs(req payment.CreatePaymentRequest) (string, string) {
	notifyURL := strings.TrimSpace(req.NotifyURL)
	if notifyURL == "" {
		notifyURL = strings.TrimSpace(x.config["notifyUrl"])
	}
	returnURL := strings.TrimSpace(req.ReturnURL)
	if returnURL == "" {
		returnURL = strings.TrimSpace(x.config["returnUrl"])
	}
	return notifyURL, returnURL
}

func (x *XunHuPay) post(ctx context.Context, endpoint string, params map[string]string) ([]byte, error) {
	signed := cloneStringMap(params)
	signed["appid"] = strings.TrimSpace(x.config["appId"])
	now := x.now
	if now == nil {
		now = time.Now
	}
	ts := strconv.FormatInt(now().Unix(), 10)
	if strings.TrimSpace(signed["time"]) == "" {
		signed["time"] = ts
	}
	nonce := x.nonce
	if nonce == nil {
		nonce = randomXunHuPayNonce
	}
	if strings.TrimSpace(signed["nonce_str"]) == "" {
		signed["nonce_str"] = nonce()
	}
	signed["hash"] = xunhupaySign(signed, x.config["appSecret"])

	form := url.Values{}
	for k, v := range signed {
		form.Set(k, v)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	client := x.httpClient
	if client == nil {
		client = &http.Client{Timeout: xunhupayHTTPTimeout}
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer func() { _ = resp.Body.Close() }()
	body, err := io.ReadAll(io.LimitReader(resp.Body, xunhupayMaxResponseSize))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("xunhupay HTTP %d: %s", resp.StatusCode, summarizeXunHuPayResponse(body))
	}
	return body, nil
}

type xunhupayAPIResponse struct {
	OpenID        int64             `json:"openid"`
	OpenOrderID   string            `json:"open_order_id"`
	URLQrcode     string            `json:"url_qrcode"`
	URL           string            `json:"url"`
	ErrCode       json.RawMessage   `json:"errcode"`
	ErrMsg        string            `json:"errmsg"`
	Hash          string            `json:"hash"`
	OutRefundNo   string            `json:"out_refund_no"`
	RefundStatus  string            `json:"refund_status"`
	Data          xunhupayOrderData `json:"data"`
}

type xunhupayOrderData struct {
	OpenOrderID   string `json:"open_order_id"`
	TotalAmount   string `json:"total_amount"`
	Title         string `json:"title"`
	Status        string `json:"status"`
	TransactionID string `json:"transaction_id"`
	PaidDate      string `json:"paid_date"`
	OutTradeOrder string `json:"out_trade_order"`
}

func (resp xunhupayAPIResponse) err(op string) error {
	code, ok := parseXunHuPayErrCode(resp.ErrCode)
	if !ok {
		return fmt.Errorf("xunhupay %s: %s", op, summarizeXunHuPayResponse(resp.ErrCode))
	}
	if code == 0 {
		return nil
	}
	msg := strings.TrimSpace(resp.ErrMsg)
	if msg == "" {
		msg = summarizeXunHuPayResponse(resp.ErrCode)
	}
	return fmt.Errorf("xunhupay %s failed: %s", op, msg)
}

func parseXunHuPayErrCode(raw json.RawMessage) (int, bool) {
	if len(bytesTrimSpace(raw)) == 0 {
		return 0, true
	}
	var n int
	if err := json.Unmarshal(raw, &n); err == nil {
		return n, true
	}
	var s string
	if err := json.Unmarshal(raw, &s); err == nil {
		s = strings.TrimSpace(s)
		if s == "" {
			return 0, true
		}
		n, err := strconv.Atoi(s)
		if err != nil {
			return 0, false
		}
		return n, true
	}
	return 0, false
}

func bytesTrimSpace(raw json.RawMessage) []byte {
	return []byte(strings.TrimSpace(string(raw)))
}

func parseXunHuPayNotifyBody(rawBody string) (map[string]string, error) {
	rawBody = strings.TrimSpace(rawBody)
	if rawBody == "" {
		return nil, fmt.Errorf("parse notify: empty body")
	}
	if strings.HasPrefix(rawBody, "{") {
		var payload map[string]any
		if err := json.Unmarshal([]byte(rawBody), &payload); err != nil {
			return nil, fmt.Errorf("parse notify: %w", err)
		}
		params := make(map[string]string, len(payload))
		for k, v := range payload {
			if s := stringifyXunHuPayValue(v); s != "" {
				params[k] = s
			}
		}
		return params, nil
	}
	values, err := url.ParseQuery(rawBody)
	if err != nil {
		return nil, fmt.Errorf("parse notify: %w", err)
	}
	params := make(map[string]string, len(values))
	for k := range values {
		params[k] = values.Get(k)
	}
	return params, nil
}

func stringifyXunHuPayValue(v any) string {
	switch typed := v.(type) {
	case nil:
		return ""
	case string:
		return strings.TrimSpace(typed)
	case float64:
		if typed == float64(int64(typed)) {
			return strconv.FormatInt(int64(typed), 10)
		}
		return strconv.FormatFloat(typed, 'f', -1, 64)
	case json.Number:
		return strings.TrimSpace(typed.String())
	case bool:
		return strconv.FormatBool(typed)
	default:
		b, err := json.Marshal(typed)
		if err != nil {
			return strings.TrimSpace(fmt.Sprint(typed))
		}
		return strings.TrimSpace(string(b))
	}
}

func mapXunHuPayOrderStatus(status string) string {
	switch strings.ToUpper(strings.TrimSpace(status)) {
	case xunhupayStatusPaid:
		return payment.ProviderStatusPaid
	case xunhupayStatusCancelled:
		return payment.ProviderStatusRefunded
	case xunhupayStatusRefunding, xunhupayStatusRefundFailed:
		return payment.ProviderStatusFailed
	default:
		return payment.ProviderStatusPending
	}
}

func xunhupaySign(params map[string]string, secret string) string {
	keys := make([]string, 0, len(params))
	for k, v := range params {
		if k == "hash" || v == "" {
			continue
		}
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var buf strings.Builder
	for i, k := range keys {
		if i > 0 {
			_ = buf.WriteByte('&')
		}
		_, _ = buf.WriteString(k + "=" + params[k])
	}
	_, _ = buf.WriteString(secret)
	sum := md5.Sum([]byte(buf.String()))
	return hex.EncodeToString(sum[:])
}

func xunhupayVerifyHash(params map[string]string, secret, hash string) bool {
	return hmac.Equal([]byte(xunhupaySign(params, secret)), []byte(strings.ToLower(strings.TrimSpace(hash))))
}

func randomXunHuPayNonce() string {
	var buf [8]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 16)
	}
	return hex.EncodeToString(buf[:])
}

func isXunHuPayRefundOrderNotFound(err error) bool {
	if err == nil {
		return false
	}
	msg := err.Error()
	lower := strings.ToLower(msg)
	return strings.Contains(msg, "订单不存在") ||
		strings.Contains(msg, "订单编号不存在") ||
		strings.Contains(lower, "order not found") ||
		strings.Contains(lower, "not exist")
}

func summarizeXunHuPayResponse(body []byte) string {
	summary := strings.Join(strings.Fields(string(body)), " ")
	if summary == "" {
		return "<empty>"
	}
	if len(summary) > xunhupayMaxErrorSummary {
		truncated := summary[:xunhupayMaxErrorSummary]
		for len(truncated) > 0 && !utf8.ValidString(truncated) {
			truncated = truncated[:len(truncated)-1]
		}
		return truncated + "..."
	}
	return summary
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if trimmed := strings.TrimSpace(value); trimmed != "" && trimmed != "0" {
			return trimmed
		}
	}
	return ""
}
