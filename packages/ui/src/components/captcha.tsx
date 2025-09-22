// captcha.ts
import { Turnstile, TurnstileInstance, TurnstileProps } from '@marsidev/react-turnstile'
import { useRef, forwardRef } from 'react'

/**
 * @description Props for the Captcha component, matching your original API.
 */
interface CaptchaProps {
  siteKey: string
  setToken: (token: string | null) => void
  onMessage: (message: string) => void
  options?: TurnstileProps['options'] // Making options configurable is still a good improvement
}

/**
 * @description A reusable and controllable Cloudflare Turnstile Captcha component.
 * It is separated from the hook for performance but uses your preferred props.
 */
export const Captcha = forwardRef<TurnstileInstance, CaptchaProps>(
  ({ siteKey, setToken, onMessage, options }, ref) => {
    return (
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={(token) => {
          setToken(token)
        }}
        onExpire={() => {
          onMessage('Captcha expired, please complete it again.')
          setToken(null)
        }}
        onError={() => {
          onMessage('Captcha error, please try again.')
          setToken(null)
        }}
        onReset={() => {
          setToken(null)
          onMessage('Captcha reset.')
        }}
        onUnsupported={() => {
          onMessage('Captcha unsupported, please try again.')
          setToken(null)
        }}
        options={{
          size: 'flexible',
          ...options,
        }}
      />
    )
  }
)

Captcha.displayName = 'Captcha'

/**
 * @description A hook to manage the Captcha component instance.
 * @returns A ref to attach to the Captcha component and a reset function.
 */
export const useCaptcha = () => {
  const captchaRef = useRef<TurnstileInstance>(null)

  const resetCaptcha = () => {
    captchaRef.current?.reset()
  }

  return { captchaRef, resetCaptcha }
}
