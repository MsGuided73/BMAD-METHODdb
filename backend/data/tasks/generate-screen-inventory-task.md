# Generate Screen Inventory Task

## Purpose

To systematically identify, document, and specify all screens/pages required for the project based on the UI/UX Specification and user flows. This task bridges the gap between high-level UI/UX strategy and detailed component specifications, ensuring no screens are overlooked and all screens are properly specified for development.

## Inputs

- UI/UX Specification (`front-end-spec.md` or equivalent)
- Product Requirements Document (PRD) (`prd.md` or equivalent)
- Frontend Architecture Document (`front-end-architecture.md` or equivalent)
- User flows and wireframes (if available)

## Key Activities & Instructions

### 1. Analyze Existing Documentation

- **Review UI/UX Specification:** Extract all mentioned screens, pages, and views
- **Review User Flows:** Identify every screen/page referenced in user journeys
- **Review PRD Epics/Stories:** Identify screens implied by user stories
- **Cross-reference:** Ensure no screens are missed across documents

### 2. Create Screen Inventory Overview

Using the `screen-inventory-tmpl.md` template:

- **List all identified screens** in the overview table
- **Assign routes/URLs** based on information architecture
- **Map to Epic.Story references** from the PRD
- **Set priority levels** (High/Medium/Low) based on MVP requirements
- **Initialize status** as "Pending"

### 3. Detailed Screen Specifications

For each screen identified, complete the full specification:

#### 3.1 Basic Information
- Define the exact route/URL path
- Reference the specific user story that requires this screen
- Set priority level and screen type (Page/Modal/Drawer/Component)

#### 3.2 Purpose & User Goals
- **Ask clarifying questions** if the screen's purpose isn't clear
- Define what users want to accomplish on this screen
- Establish success criteria for the screen

#### 3.3 Content & Layout Planning
- Identify key content areas and their purposes
- Consider responsive layout requirements
- Plan information hierarchy

#### 3.4 Component Requirements Analysis
- **Identify all UI components** needed for the screen
- For each component, specify its purpose and behavior
- Note if components are reusable across multiple screens
- Flag components that need to be created vs. existing ones

#### 3.5 Data Requirements Specification
- **Define data sources** (APIs, local state, props)
- **Create TypeScript interfaces** for screen data requirements
- **Specify loading and error states** for all data dependencies
- Consider data validation and transformation needs

#### 3.6 User Interaction Design
- **List all possible user actions** on the screen
- **Define expected outcomes** for each action
- Consider edge cases and error scenarios
- Plan feedback mechanisms for user actions

#### 3.7 Navigation Planning
- **Map entry points** - how users get to this screen
- **Map exit points** - where users can go from this screen
- **Define breadcrumb hierarchy** if applicable
- Consider deep linking and URL state management

#### 3.8 Responsive & Accessibility Planning
- **Define responsive behavior** for desktop, tablet, mobile
- **Specify accessibility requirements** (ARIA, keyboard navigation)
- **Plan screen reader considerations**
- Consider touch vs. mouse interactions

### 4. Create Supporting Diagrams

#### 4.1 Screen Flow Diagram
- **Use Mermaid syntax** to create a visual flow between screens
- Show primary navigation paths
- Include modal and overlay relationships

#### 4.2 Component Usage Matrix
- **Create a matrix** showing which components are used on which screens
- Identify the most reusable components
- Flag components that might need variations per screen

### 5. Validation & Quality Assurance

#### 5.1 Completeness Check
- **Verify all user flows** are covered by the screen inventory
- **Check all PRD requirements** are addressed by screens
- **Ensure no orphaned screens** (screens with no clear purpose)

#### 5.2 Consistency Review
- **Review naming conventions** for screens and routes
- **Check data interface consistency** across screens
- **Validate navigation patterns** are consistent

#### 5.3 Development Readiness
- **Complete the handoff checklist** in the template
- **Ensure all placeholders** are filled with actual content
- **Verify technical feasibility** of all specified requirements

### 6. Collaboration & Iteration

#### 6.1 User Feedback
- **Present the screen inventory** to the user for review
- **Ask specific questions** about unclear requirements
- **Validate assumptions** about user goals and behaviors

#### 6.2 Technical Validation
- **Consider technical constraints** from the architecture document
- **Validate data requirements** against available APIs
- **Check component feasibility** with chosen tech stack

## Output Deliverables

1. **Completed Screen Inventory Document** (`{project-name}-screen-inventory.md`)
   - All screens documented with complete specifications
   - Screen flow diagrams
   - Component usage matrix
   - Development handoff checklist

2. **Component Requirements List**
   - Comprehensive list of all components needed
   - Component reusability analysis
   - Priority order for component development

3. **Data Requirements Summary**
   - All API endpoints and data sources needed
   - TypeScript interfaces for all screen data
   - Loading and error state specifications

## Success Criteria

- [ ] All screens from user flows are documented
- [ ] Every screen has complete specification details
- [ ] Component requirements are clearly identified
- [ ] Data requirements are fully specified with TypeScript interfaces
- [ ] Navigation patterns are consistent and logical
- [ ] Responsive and accessibility requirements are defined
- [ ] Development team can implement screens without additional clarification
- [ ] Screen inventory aligns with PRD requirements and UI/UX specification

## Next Steps

After completing this task:
1. **Review with stakeholders** to validate screen requirements
2. **Proceed to component specification** task for detailed component design
3. **Create development stories** based on screen specifications
4. **Begin frontend development** with clear implementation guidance

## Notes for AI Agent

- **Be thorough but practical** - focus on MVP requirements first
- **Ask clarifying questions** when screen purposes are unclear
- **Use consistent naming conventions** throughout the document
- **Consider technical feasibility** when specifying requirements
- **Prioritize user experience** while maintaining development efficiency
