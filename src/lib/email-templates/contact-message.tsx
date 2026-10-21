import * as React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  message?: string
}

const ContactMessage = ({ name, email, message }: Props) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Nytt meddelande från {name || 'en besökare'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nytt meddelande via Cylinderhjälpen</Heading>
        <Text style={label}>Namn</Text>
        <Text style={text}>{name || '–'}</Text>
        <Text style={label}>E-post</Text>
        <Text style={text}>{email || '–'}</Text>
        <Hr style={hr} />
        <Text style={label}>Meddelande</Text>
        <Text style={{ ...text, whiteSpace: 'pre-wrap' }}>{message || '–'}</Text>
        <Hr style={hr} />
        <Text style={small}>Svara direkt på mejlet för att svara avsändaren.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactMessage,
  subject: (d: Record<string, any>) => `Kontakt från ${d['name'] || 'besökare'} – Cylinderhjälpen`,
  displayName: 'Kontaktformulär',
  to: 'cylinderkalkyl@gmail.com',
  previewData: { name: 'Anna Andersson', email: 'anna@example.com', message: 'Hej! Jag har en fråga om runda cylindrar.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '20px', color: '#1f2937', margin: '0 0 20px' }
const label = { fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' as const, margin: '12px 0 2px' }
const text = { fontSize: '15px', color: '#111827', margin: '0' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const small = { fontSize: '12px', color: '#6b7280' }
