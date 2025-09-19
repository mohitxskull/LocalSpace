import { Title, TitleProps } from '@mantine/core'
import Link from 'next/link.js'
import { setting } from '../configs/setting.js'

type LogoProps = TitleProps & {
  href?: string
  onClick?: () => void
}

export const LogoBase = ({ href, onClick, children, ...props }: LogoProps) => {
  return (
    <>
      <Title
        {...props}
        {...(onClick
          ? { onClick }
          : {
              renderRoot: (p) => <Link {...p} href={href ?? '/'} />,
            })}
        style={{
          textDecoration: 'none',
        }}
      >
        {children}
      </Title>
    </>
  )
}

export const Logo = (props: LogoProps) => {
  return (
    <>
      <LogoBase order={3} {...props} fs="italic" c="primary">
        {setting.app.name}
      </LogoBase>
    </>
  )
}
