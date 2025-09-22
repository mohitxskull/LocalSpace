import { LoadingOverlay } from '@mantine/core'
import { Logo } from './logo.js'

export const LogoLoadingOverlay = () => {
  return (
    <>
      <LoadingOverlay visible loaderProps={{ children: <Logo /> }} />
    </>
  )
}
