import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  companyName?: string
  email?: string
  seats?: number
}

const CompanyWelcome = ({ companyName, email, seats }: Props) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>{companyName || 'Ert företag'} har nu Cylinderhjälpen Pro</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Välkommen till Cylinderhjälpen Pro</Heading>
        <Text style={text}>
          {companyName || 'Ert företag'} har fått en företagslicens{seats ? ` för ${seats} tekniker` : ''}. Du är admin för kontot.
        </Text>
        <Text style={text}>
          Logga in eller skapa konto med <b>{email || 'den här e-postadressen'}</b> så är Pro upplåst direkt. Under <b>Mitt konto</b> lägger du till dina tekniker – de får en egen inbjudan på mejl.
        </Text>
        <Button href="https://cylinderhjalpen.se/konto" style={button}>Öppna Mitt konto</Button>
        <Text style={small}>Fick du mejlet av misstag? Då kan du bortse från det.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CompanyWelcome,
  subject: (d: Record<string, any>) => `${d['companyName'] || 'Ert företag'} har nu Cylinderhjälpen Pro`,
  displayName: 'Välkommen företagsadmin',
  previewData: { companyName: 'Låsfirman AB', email: 'chef@foretag.se', seats: 5 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '520px' }
const h1 = { fontSize: '22px', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.5', margin: '0 0 14px' }
const button = { backgroundColor: '#ea6a1f', color: '#ffffff', padding: '12px 22px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', textDecoration: 'none', display: 'inline-block', margin: '8px 0 20px' }
const small = { fontSize: '12px', color: '#888888', margin: '0' }
