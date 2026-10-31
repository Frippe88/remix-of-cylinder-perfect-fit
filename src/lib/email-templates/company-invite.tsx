import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  companyName?: string
  email?: string
}

const CompanyInvite = ({ companyName, email }: Props) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Du har fått Cylinderhjälpen Pro via {companyName || 'ditt företag'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Välkommen till Cylinderhjälpen Pro</Heading>
        <Text style={text}>
          {companyName || 'Ditt företag'} har lagt till dig som tekniker. Pro ingår via företaget – du betalar ingenting själv.
        </Text>
        <Text style={text}>
          Logga in eller skapa konto med <b>{email || 'den här e-postadressen'}</b> så låses Pro upp direkt.
        </Text>
        <Button href="https://cylinderhjalpen.se/pro" style={button}>Öppna Pro</Button>
        <Text style={small}>Fick du mejlet av misstag? Då kan du bortse från det.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CompanyInvite,
  subject: (d: Record<string, any>) => `${d['companyName'] || 'Ditt företag'} har bjudit in dig till Cylinderhjälpen Pro`,
  displayName: 'Inbjudan tekniker',
  previewData: { companyName: 'Låsfirman AB', email: 'tekniker@foretag.se' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '520px' }
const h1 = { fontSize: '22px', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.5', margin: '0 0 14px' }
const button = { backgroundColor: '#ea6a1f', color: '#ffffff', padding: '12px 22px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', textDecoration: 'none', display: 'inline-block', margin: '8px 0 20px' }
const small = { fontSize: '12px', color: '#888888', margin: '0' }
