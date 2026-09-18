export type FeaturedModelCategory = 'image' | 'video' | 'chat'

export interface FeaturedModel {
  id: string
  name: string
  vendor: string
  category: FeaturedModelCategory
  description: string
  price: string
  savePct?: number
}

export const featuredModels: FeaturedModel[] = [
  {
    id: 'nano-banana',
    name: 'Nano banana',
    vendor: 'Gemini',
    category: 'image',
    description:
      'Gemini 2.5 Flash Image is Google DeepMind’s fast, conversational image generation and editing model with strong character consistency and multi-image fusion.',
    price: '$0.0125',
    savePct: 20
  },
  {
    id: 'seedream-5-pro',
    name: 'Seedream 5.0 Pro',
    vendor: 'ByteDance',
    category: 'image',
    description:
      'Quality-first text-to-image model with cinematic 1K/2K output, strong text rendering, and up to 10 reference images in one call.',
    price: '$0.036/1K'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    vendor: 'Midjourney',
    category: 'image',
    description:
      'A leading text-to-image model known for painterly aesthetics, strong composition, and cinematic lighting — accessible through a unified API.',
    price: '$0.045',
    savePct: 20
  },
  {
    id: 'wan-2-7-image',
    name: 'Wan 2.7 Image',
    vendor: 'Alibaba',
    category: 'image',
    description:
      'An advanced Wan 2.7 image model for detailed, realistic visuals from text and reference images, suited to product and marketing workflows.',
    price: '$0.0216',
    savePct: 20
  },
  {
    id: 'gpt-image-2',
    name: 'GPT Image 2',
    vendor: 'OpenAI',
    category: 'image',
    description:
      'Next-gen image generation with near-perfect text rendering, native 4K output, and deep world knowledge for production workflows.',
    price: '$0.0085',
    savePct: 20
  },
  {
    id: 'gpt-image-1',
    name: 'GPT Image 1 Official',
    vendor: 'OpenAI',
    category: 'image',
    description:
      'An official GPT-Image model for high-quality image creation and editing with strong text and image understanding.',
    price: '$0.1069',
    savePct: 20
  },
  {
    id: 'qwen-image-2',
    name: 'Qwen Image 2.0',
    vendor: 'Alibaba',
    category: 'image',
    description:
      'Combines generation and editing, supports long prompts, and delivers high-quality 2K output with clear text and design aesthetics.',
    price: '$0.02/1K',
    savePct: 20
  },
  {
    id: 'z-image-turbo',
    name: 'Z Image Turbo',
    vendor: 'Alibaba',
    category: 'image',
    description:
      'A fast, efficient image model for rapid generation and batch processing without sacrificing prompt adherence.',
    price: '$0.01',
    savePct: 20
  },
  {
    id: 'sora-2',
    name: 'Sora 2',
    vendor: 'OpenAI',
    category: 'video',
    description:
      'OpenAI’s video generation model for cinematic clips from text or image prompts, with strong motion and scene consistency.',
    price: '$0.10/s',
    savePct: 20
  },
  {
    id: 'veo-3',
    name: 'Veo 3.1',
    vendor: 'Google',
    category: 'video',
    description:
      'Google DeepMind video model with high-fidelity motion, native audio options, and strong prompt following.',
    price: '$0.08/s',
    savePct: 20
  },
  {
    id: 'kling-o1',
    name: 'Kling Video O1',
    vendor: 'Kuaishou',
    category: 'video',
    description:
      'A high-quality video generation model with smooth motion, camera control, and image-to-video workflows.',
    price: '$0.056/s',
    savePct: 20
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4.5',
    vendor: 'Anthropic',
    category: 'chat',
    description:
      'Anthropic’s balanced coding and reasoning model with strong tool use, long context, and production-grade reliability.',
    price: '$3 / $15',
    savePct: 20
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    vendor: 'OpenAI',
    category: 'chat',
    description:
      'OpenAI’s multimodal flagship for chat, vision, and tools — drop-in compatible with the OpenAI SDK.',
    price: '$2.5 / $10',
    savePct: 20
  },
  {
    id: 'gemini-3',
    name: 'Gemini 3 Flash',
    vendor: 'Google',
    category: 'chat',
    description:
      'Google’s fast multimodal model for low-latency chat, coding, and long-context analysis.',
    price: '$0.15 / $0.60',
    savePct: 20
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3.2',
    vendor: 'DeepSeek',
    category: 'chat',
    description:
      'A high-value reasoning and coding model with strong benchmark results at a fraction of frontier prices.',
    price: '$0.28 / $0.42',
    savePct: 20
  }
]
