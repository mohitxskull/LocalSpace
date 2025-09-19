import { Turnstile } from '@marsidev/react-turnstile'

export const Captcha = (props: {
  key: string
  setToken: (token: string | null) => void
  onMessage: (data: { title: string; message: string }) => void
}) => {
  return (
    <>
      <Turnstile
        siteKey={props.key}
        onSuccess={(t) => {
          props.setToken(t)
        }}
        onExpire={() => {
          props.onMessage({
            title: 'Captcha Expired',
            message: 'Complete it again',
          })

          props.setToken(null)
        }}
        onError={() => {
          props.onMessage({
            title: 'Captcha Error',
            message: 'Please try again',
          })

          props.setToken(null)
        }}
        options={{
          size: 'flexible',
        }}
      />
    </>
  )
}
