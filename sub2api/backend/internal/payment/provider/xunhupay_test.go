package provider

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/payment"
)

func TestXunHuPaySignExcludesHashAndEmptyValues(t *testing.T) {
	t.Parallel()

	secret := "app-secret"
	base := map[string]string{
		"appid": "20146122002",
		"time":  "1522390464",
	}
	withExtras := map[string]string{
		"appid":     "20146122002",
		"time":      "1522390464",
		"hash":      "should-be-ignored",
		"nonce_str": "",
	}

	if got, want := xunhupaySign(base, secret), xunhupaySign(withExtras, secret); got != want {
		t.Fatalf("hash and empty values should be excluded: %q != %q", got, want)
	}
	if len(xunhupaySign(base, secret)) != 32 {
		t.Fatalf("MD5 hex should be 32 chars, got %d", len(xunhupaySign(base, secret)))
	}
}

func TestXunHuPayVerifyHashValid(t *testing.T) {
	t.Parallel()

	params := map[string]string{
		"appid":          "20146122002",
		"trade_order_id": "sub2_123",
		"total_fee":      "12.34",
		"status":         "OD",
	}
	secret := "secret-key"
	hash := xunhupaySign(params, secret)
	if !xunhupayVerifyHash(params, secret, hash) {
		t.Fatal("expected valid hash to verify")
	}
	if xunhupayVerifyHash(params, secret, "deadbeef") {
		t.Fatal("expected invalid hash to fail")
	}
}

func TestNewXunHuPayNormalizesAPIBase(t *testing.T) {
	t.Parallel()

	p, err := NewXunHuPay("1", map[string]string{
		"appId":     "app-id",
		"appSecret": "app-secret",
		"apiBase":   "https://api.xunhupay.com/payment/do.html",
	})
	if err != nil {
		t.Fatalf("NewXunHuPay returned error: %v", err)
	}
	if got, want := p.apiBase(), "https://api.xunhupay.com"; got != want {
		t.Fatalf("apiBase = %q, want %q", got, want)
	}
}

func TestXunHuPayCreatePaymentUsesImageURLNotQRPayload(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/payment/do.html" {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		body, _ := io.ReadAll(r.Body)
		values, err := url.ParseQuery(string(body))
		if err != nil {
			t.Fatalf("parse form: %v", err)
		}
		if values.Get("version") != xunhupayAPIVersion {
			t.Fatalf("version = %q", values.Get("version"))
		}
		if values.Get("trade_order_id") != "sub2_123" {
			t.Fatalf("trade_order_id = %q", values.Get("trade_order_id"))
		}
		if values.Get("hash") == "" {
			t.Fatal("missing hash")
		}
		_, _ = w.Write([]byte(`{"openid":20351731,"url":"https://api.xunhupay.com/alipay/pay/index.html?id=1","url_qrcode":"https://api.xunhupay.com/qrcode/1.png","errcode":0,"errmsg":"success!"}`))
	}))
	defer server.Close()

	p, err := NewXunHuPay("1", map[string]string{
		"appId":     "app-id",
		"appSecret": "app-secret",
		"apiBase":   server.URL,
		"notifyUrl": "https://merchant.example.com/api/v1/payment/webhook/xunhupay",
	})
	if err != nil {
		t.Fatalf("NewXunHuPay returned error: %v", err)
	}
	p.now = func() time.Time { return time.Unix(1522390464, 0) }
	p.nonce = func() string { return "fixed-nonce" }

	resp, err := p.CreatePayment(context.Background(), payment.CreatePaymentRequest{
		OrderID:     "sub2_123",
		Amount:      "12.34",
		PaymentType: payment.TypeAlipay,
		Subject:     "Test Product",
	})
	if err != nil {
		t.Fatalf("CreatePayment returned error: %v", err)
	}
	if resp.QRCode != "" {
		t.Fatalf("QRCode should stay empty so frontend does not encode the image URL, got %q", resp.QRCode)
	}
	if resp.QRCodeImg != "https://api.xunhupay.com/qrcode/1.png" {
		t.Fatalf("QRCodeImg = %q", resp.QRCodeImg)
	}
	if resp.PayURL != "" {
		t.Fatalf("desktop PayURL should stay empty, got %q", resp.PayURL)
	}
	if resp.TradeNo != "20351731" {
		t.Fatalf("TradeNo = %q", resp.TradeNo)
	}

	mobile, err := p.CreatePayment(context.Background(), payment.CreatePaymentRequest{
		OrderID:     "sub2_123",
		Amount:      "12.34",
		PaymentType: payment.TypeAlipay,
		Subject:     "Test Product",
		IsMobile:    true,
	})
	if err != nil {
		t.Fatalf("mobile CreatePayment returned error: %v", err)
	}
	if mobile.QRCodeImg != "" {
		t.Fatalf("mobile QRCodeImg should stay empty, got %q", mobile.QRCodeImg)
	}
	if mobile.PayURL != "https://api.xunhupay.com/alipay/pay/index.html?id=1" {
		t.Fatalf("mobile PayURL = %q", mobile.PayURL)
	}

	popupProvider, err := NewXunHuPay("1", map[string]string{
		"appId":       "app-id",
		"appSecret":   "app-secret",
		"apiBase":     server.URL,
		"notifyUrl":   "https://merchant.example.com/api/v1/payment/webhook/xunhupay",
		"paymentMode": "popup",
	})
	if err != nil {
		t.Fatalf("NewXunHuPay popup returned error: %v", err)
	}
	popupProvider.now = p.now
	popupProvider.nonce = p.nonce
	popup, err := popupProvider.CreatePayment(context.Background(), payment.CreatePaymentRequest{
		OrderID:     "sub2_123",
		Amount:      "12.34",
		PaymentType: payment.TypeAlipay,
		Subject:     "Test Product",
	})
	if err != nil {
		t.Fatalf("popup CreatePayment returned error: %v", err)
	}
	if popup.QRCodeImg != "" {
		t.Fatalf("popup QRCodeImg should stay empty, got %q", popup.QRCodeImg)
	}
	if popup.PayURL != "https://api.xunhupay.com/alipay/pay/index.html?id=1" {
		t.Fatalf("popup PayURL = %q", popup.PayURL)
	}
}

func TestXunHuPayQueryOrderMapsPaidStatus(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/payment/query.html" {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		_, _ = w.Write([]byte(`{"errcode":0,"errmsg":"success!","data":{"status":"OD","open_order_id":"xh_1","total_amount":"12.34","transaction_id":"txn_1","out_trade_order":"sub2_123"}}`))
	}))
	defer server.Close()

	p, err := NewXunHuPay("1", map[string]string{
		"appId":     "app-id",
		"appSecret": "app-secret",
		"apiBase":   server.URL,
	})
	if err != nil {
		t.Fatalf("NewXunHuPay returned error: %v", err)
	}

	resp, err := p.QueryOrder(context.Background(), "sub2_123")
	if err != nil {
		t.Fatalf("QueryOrder returned error: %v", err)
	}
	if resp.Status != payment.ProviderStatusPaid {
		t.Fatalf("status = %q, want %q", resp.Status, payment.ProviderStatusPaid)
	}
	if resp.TradeNo != "txn_1" {
		t.Fatalf("trade no = %q", resp.TradeNo)
	}
	if resp.Amount != 12.34 {
		t.Fatalf("amount = %v", resp.Amount)
	}
}

func TestXunHuPayVerifyNotification(t *testing.T) {
	t.Parallel()

	p, err := NewXunHuPay("1", map[string]string{
		"appId":     "app-id",
		"appSecret": "app-secret",
	})
	if err != nil {
		t.Fatalf("NewXunHuPay returned error: %v", err)
	}

	params := map[string]string{
		"appid":            "app-id",
		"trade_order_id":   "sub2_123",
		"total_fee":        "12.34",
		"transaction_id":   "txn_1",
		"open_order_id":    "xh_1",
		"status":           "OD",
		"time":             "1522390464",
		"nonce_str":        "abc",
	}
	params["hash"] = xunhupaySign(params, "app-secret")
	form := url.Values{}
	for k, v := range params {
		form.Set(k, v)
	}

	n, err := p.VerifyNotification(context.Background(), form.Encode(), nil)
	if err != nil {
		t.Fatalf("VerifyNotification returned error: %v", err)
	}
	if n.OrderID != "sub2_123" {
		t.Fatalf("OrderID = %q", n.OrderID)
	}
	if n.TradeNo != "txn_1" {
		t.Fatalf("TradeNo = %q", n.TradeNo)
	}
	if n.Status != payment.ProviderStatusSuccess {
		t.Fatalf("Status = %q", n.Status)
	}
	if n.Metadata["appid"] != "app-id" {
		t.Fatalf("metadata appid = %q", n.Metadata["appid"])
	}
}
