# Create Style Guide Task

## Purpose

To collaboratively work with the user to define and document a comprehensive visual design system and style guide for the project. This task creates the foundation for consistent UI implementation by establishing color schemes, typography, spacing, and component styling standards that will be used throughout the application.

## Inputs

- Project Brief (`project-brief.md` or equivalent)
- Product Requirements Document (PRD) (`prd.md` or equivalent)
- UI/UX Specification (`front-end-spec.md` or equivalent)
- Any existing brand guidelines or design assets
- User preferences and requirements

## Key Activities & Instructions

### 1. Understand Brand & Project Context

#### 1.1 Review Existing Materials
- **Analyze Project Brief:** Extract brand personality, target audience, and project goals
- **Review PRD:** Understand user interaction goals and design preferences
- **Check UI/UX Spec:** Identify any existing design decisions or constraints
- **Assess Existing Assets:** Review any logos, brand materials, or design references

#### 1.2 Clarify Brand Identity
**Ask the user about:**
- Brand mission and core values
- Brand personality traits (professional, friendly, modern, etc.)
- Target audience and their preferences
- Competitive landscape and differentiation goals
- Any existing brand guidelines or restrictions

### 2. Establish Color System

#### 2.1 Primary Brand Colors
**Collaborate with the user to define:**
- **Primary Color:** Main brand color for CTAs, navigation, key elements
  - Ask for hex values or color preferences
  - Generate a full scale (50-900) if only one shade is provided
  - Ensure accessibility compliance (contrast ratios)
- **Secondary Color:** Supporting brand color for accents and variety
  - Should complement the primary color
  - Generate full scale for consistency

#### 2.2 Neutral Color Palette
**Define grayscale colors:**
- True grays or warm/cool tinted grays based on brand personality
- Ensure sufficient contrast options for text and backgrounds
- Consider both light and dark theme compatibility

#### 2.3 Semantic Colors
**Establish functional colors:**
- Success (typically green)
- Warning (typically yellow/orange)
- Error (typically red)
- Info (typically blue)
- Ensure these don't conflict with brand colors

#### 2.4 Accessibility Validation
**For each color combination:**
- Verify WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Test with color blindness simulators
- Ensure colors work in high contrast mode

### 3. Define Typography System

#### 3.1 Font Selection
**Work with user to choose:**
- **Primary Font:** For headings and important text
  - Consider brand personality (serif vs sans-serif)
  - Ensure web font availability and licensing
  - Check readability across devices
- **Secondary Font:** For body text and general content
  - Prioritize readability and performance
  - Ensure good fallback options
- **Monospace Font:** For code and technical content (if needed)

#### 3.2 Typography Scale
**Establish consistent sizing:**
- Base font size (typically 16px)
- Modular scale for headings and text sizes
- Line height ratios for optimal readability
- Font weights available and their usage

#### 3.3 Typography Usage Rules
**Define clear guidelines for:**
- When to use each font family
- Appropriate font weights for different contexts
- Line height and spacing standards
- Responsive typography behavior

### 4. Create Spacing System

#### 4.1 Base Unit System
**Establish spacing foundation:**
- Base unit (typically 4px or 8px)
- Consistent scale progression
- Relationship to typography line heights
- Grid system compatibility

#### 4.2 Spacing Usage Guidelines
**Define standards for:**
- Component internal padding
- Margins between elements
- Section spacing
- Layout gaps and gutters

### 5. Define Visual Elements

#### 5.1 Shadows & Elevation
**Create shadow system:**
- Multiple shadow levels for different elevations
- Consistent shadow colors and opacity
- Usage guidelines for different component types

#### 5.2 Border Radius
**Establish rounding standards:**
- Scale of border radius values
- Usage guidelines for different components
- Consistency with overall design language

#### 5.3 Borders & Dividers
**Define border standards:**
- Border widths and styles
- Border colors from the color system
- When and how to use borders vs shadows

### 6. Iconography Standards

#### 6.1 Icon Library Selection
**Choose consistent icon system:**
- Icon library (Heroicons, Feather, Lucide, etc.)
- Icon style (outline, solid, mixed)
- Licensing and usage rights
- Customization capabilities

#### 6.2 Icon Usage Guidelines
**Establish standards for:**
- Icon sizes and scaling
- Icon colors and states
- Accessibility requirements
- Consistency across the application

### 7. Component Styling Standards

#### 7.1 Button Styles
**Define button system:**
- Primary, secondary, and tertiary button styles
- Button sizes and padding
- Hover, focus, and disabled states
- Icon button variations

#### 7.2 Form Element Styles
**Establish form standards:**
- Input field styling and states
- Label positioning and styling
- Error and success state styling
- Form validation feedback

#### 7.3 Card and Container Styles
**Define container standards:**
- Card styling and elevation
- Background colors and borders
- Padding and content spacing
- Responsive behavior

### 8. Animation & Interaction Standards

#### 8.1 Transition System
**Define animation standards:**
- Easing functions for different interactions
- Duration scales for various animations
- Consistent hover and focus effects
- Loading and state change animations

#### 8.2 Micro-interactions
**Establish interaction patterns:**
- Button press feedback
- Form field focus states
- Loading indicators
- Success/error feedback animations

### 9. Implementation Planning

#### 9.1 CSS Custom Properties
**Plan token implementation:**
- CSS custom property naming conventions
- Organization and structure
- Theme switching capabilities
- Browser compatibility considerations

#### 9.2 Framework Integration
**Consider technical implementation:**
- Tailwind CSS configuration (if applicable)
- CSS-in-JS theme objects (if applicable)
- Component library integration
- Build process considerations

### 10. Documentation & Validation

#### 10.1 Complete Style Guide Document
**Using the `style-guide-tmpl.md` template:**
- Fill all sections with specific values
- Include usage examples and guidelines
- Add implementation code snippets
- Create visual examples where helpful

#### 10.2 Quality Assurance
**Review and validate:**
- Accessibility compliance across all elements
- Consistency in naming and values
- Completeness of all design tokens
- Technical feasibility of implementation

#### 10.3 User Review & Iteration
**Collaborate with user:**
- Present completed style guide for review
- Gather feedback on color choices and typography
- Iterate on any elements that don't meet requirements
- Confirm technical implementation approach

## Output Deliverables

1. **Completed Style Guide Document** (`{project-name}-style-guide.md`)
   - Comprehensive design system documentation
   - All design tokens with specific values
   - Usage guidelines and examples
   - Implementation guidance

2. **CSS Custom Properties File** (optional)
   - Ready-to-use CSS variables
   - Organized by design token categories
   - Comments and documentation

3. **Framework Configuration** (if applicable)
   - Tailwind CSS config with custom theme
   - Or equivalent configuration for chosen CSS framework

## Success Criteria

- [ ] Complete color system with accessibility compliance
- [ ] Typography system with clear usage guidelines
- [ ] Consistent spacing system based on modular scale
- [ ] Visual elements (shadows, borders, etc.) defined
- [ ] Component styling standards established
- [ ] Animation and interaction standards defined
- [ ] Implementation approach planned and documented
- [ ] All design tokens have specific values (no placeholders)
- [ ] User has approved all design decisions
- [ ] Style guide is ready for developer implementation

## Integration with BMAD Workflow

### Timing in Process
This task should be completed **early in the Design Architect phase**, ideally:
1. After UI/UX Specification is drafted
2. Before detailed component specifications
3. Before screen inventory generation

### Dependencies
- **Requires:** Project Brief, PRD, UI/UX Specification draft
- **Enables:** Component specifications, screen inventory, frontend architecture

### Handoff to Development
The completed style guide should be referenced by:
- Component specification documents
- Frontend architecture implementation
- Development stories and acceptance criteria
- Quality assurance and design review processes

## Notes for AI Agent

- **Prioritize accessibility** - never compromise on contrast ratios or usability
- **Be systematic** - ensure all design tokens follow consistent patterns
- **Ask specific questions** - get concrete preferences rather than vague descriptions
- **Provide examples** - show color swatches, typography samples, spacing examples
- **Consider implementation** - ensure all design decisions are technically feasible
- **Document thoroughly** - include rationale for design decisions where helpful
- **Plan for scale** - create systems that can grow with the application
