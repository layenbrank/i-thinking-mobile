/**
 * CoreX / rust-service API constants.
 */
const API_SUCCESS_CODE = 200000

const API_PATHS = {
  HEALTH: '/api/health',
  AUTH_CAPTCHA: '/api/v1/auth/captcha',
  AUTH_SIGNIN: '/api/v1/auth/signin',
  AUTH_SIGNUP: '/api/v1/auth/signup',
  AUTH_PROFILE: '/api/v1/auth/profile',
  AUTH_SIGNOUT: '/api/v1/auth/signout',
  GATEWAY_CHAT: '/api/v1/gateway/chat/completions',
  GATEWAY_MODELS: '/api/v1/gateway/models'
} as const

const CAPTCHA_PLACEHOLDER = {
  captchaKey: 'mobile-dev',
  captchaValue: '0'
} as const

export { API_PATHS, API_SUCCESS_CODE, CAPTCHA_PLACEHOLDER }
