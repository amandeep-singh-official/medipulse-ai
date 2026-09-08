import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import ChatWidget from './ChatWidget'

// Mock the fetch API globally
global.fetch = vi.fn()

const mockBiomarkers = [
  { name: 'Hemoglobin', value: 15.0, unit: 'g/dL', status: 'NORMAL' as const }
]

test('ChatWidget renders toggle button initially', () => {
  render(<ChatWidget biomarkers={mockBiomarkers} />)
  // Look for the main chat button
  const toggleBtn = screen.getByRole('button', { name: /open health assistant/i })
  expect(toggleBtn).toBeInTheDocument()
})

test('ChatWidget opens and shows disclaimer on click', async () => {
  render(<ChatWidget biomarkers={mockBiomarkers} />)
  const toggleBtn = screen.getByRole('button', { name: /open health assistant/i })
  fireEvent.click(toggleBtn)
  
  // Disclaimer should be visible
  await waitFor(() => {
    expect(screen.getByText(/Not a medical professional/i)).toBeInTheDocument()
  })
})

test('ChatWidget handles sending a message', async () => {
  // Mock successful fetch for suggestions then streaming
  ;(global.fetch as any).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ has_data: false, suggestions: [] })
  })
  
  render(<ChatWidget biomarkers={mockBiomarkers} />)
  const toggleBtn = screen.getByRole('button', { name: /open health assistant/i })
  fireEvent.click(toggleBtn)
  
  // Find input and send button
  const input = screen.getByPlaceholderText(/Ask about your health/i)
  
  fireEvent.change(input, { target: { value: 'Hello AI' } })
  
  // Click send button
  const sendBtn = screen.getByRole('button', { name: /send message/i })
  fireEvent.click(sendBtn)
  
  // Input should clear after sending
  await waitFor(() => {
    expect(input).toHaveValue('')
  })
})
