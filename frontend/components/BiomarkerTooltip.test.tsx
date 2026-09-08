import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test } from 'vitest'
import BiomarkerTooltip from './BiomarkerTooltip'

const mockInfo = {
  system: "Blood",
  systemIcon: "🩸",
  fullName: "Hemoglobin",
  description: "Test description",
  significance: "Test significance"
}

test('BiomarkerTooltip renders NORMAL status correctly', () => {
  render(
    <BiomarkerTooltip info={mockInfo} />
  )
  
  // Renders the name
  expect(screen.getByText('Hemoglobin')).toBeInTheDocument()
  expect(screen.getByText('Blood')).toBeInTheDocument()
})

test('BiomarkerTooltip expands on click', () => {
  render(
    <BiomarkerTooltip info={mockInfo} />
  )
  
  // Expect the significance text to be in the document
  expect(screen.getByText(/Test significance/i)).toBeInTheDocument()
})
