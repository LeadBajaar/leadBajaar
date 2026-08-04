import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs } from '@/components/ui/tabs'
import { TeamTab } from '../TeamTab'
import { TeamMember } from '@/types/events'

const alex: TeamMember = { id: 1, name: 'Alex Thompson', email: 'alex@example.com', role: 'Agent' }
const sarah: TeamMember = { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Manager' }

const renderTeamTab = (props: Partial<React.ComponentProps<typeof TeamTab>> = {}) => {
  const toggleTeamMember = jest.fn()
  const utils = render(
    <Tabs defaultValue="team">
      <TeamTab
        eventType={{ teamMembers: [] }}
        toggleTeamMember={toggleTeamMember}
        availableMembers={[alex, sarah]}
        {...props}
      />
    </Tabs>
  )
  return { toggleTeamMember, ...utils }
}

describe('TeamTab', () => {
  it('lists every available member with their name, email and role', () => {
    renderTeamTab()

    expect(screen.getByText('Alex Thompson')).toBeInTheDocument()
    expect(screen.getByText('alex@example.com')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
  })

  it('shows the assigned count from eventType.teamMembers, not the available pool', () => {
    renderTeamTab({ eventType: { teamMembers: [alex] } })
    expect(screen.getByText('1 Assigned')).toBeInTheDocument()
  })

  it('calls toggleTeamMember with the clicked member', () => {
    const { toggleTeamMember } = renderTeamTab()

    fireEvent.click(screen.getByText('Sarah Johnson'))

    expect(toggleTeamMember).toHaveBeenCalledWith(sarah)
  })

  it('marks a member as selected only when they are in eventType.teamMembers, not just in the available pool', () => {
    renderTeamTab({ eventType: { teamMembers: [alex] } })

    // Only the selected member's card should render the check indicator.
    expect(screen.getAllByTestId('member-selected-indicator')).toHaveLength(1)
  })

  it('shows an empty state when there is no company roster to pick from', () => {
    renderTeamTab({ availableMembers: [] })
    expect(screen.getByText('No Team Members Found')).toBeInTheDocument()
  })

  it('does not show the empty state once a roster is available, even with nobody assigned yet', () => {
    renderTeamTab({ eventType: { teamMembers: [] } })
    expect(screen.queryByText('No Team Members Found')).not.toBeInTheDocument()
  })
})
