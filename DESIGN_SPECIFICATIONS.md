# 🎨 IamBillBoard - EXACT DESIGN SPECIFICATIONS

## ⚠️ CRITICAL: DO NOT CHANGE ANY DESIGN ELEMENTS
This document contains the EXACT design specifications. Any deviation will create a different website.

## 🎯 Homepage Design (EXACT SPECIFICATIONS)

### Hero Section
```css
Background: Linear gradient from dark purple to black
Colors: bg-gradient-to-r from-purple-900 via-purple-800 to-gray-900
Text Color: White
Main Heading: "Custom Bottle Advertising Revolution"
Subheading: "Transform your brand with premium custom bottle labels"
Button: Pink/red gradient "Start Creating Now"
```

### Stats Section  
```css
Background: Dark with pink accents
Stats: "50K+ Orders", "500+ Designs", "7 Days Delivery"
Colors: Text white, numbers in pink (#ec4899)
Layout: 3 columns, centered alignment
```

### Bottle Section
```css
Background: Dark gradient 
Heading: "Choose Your Bottle Size"
Cards: Dark background with pink borders
Bottle Types: 750ml, 1L, 1.5L options
Price Display: ₹X per bottle in pink color
```

## 📱 Mobile Design Requirements
- Responsive breakpoints: sm, md, lg, xl
- Mobile navigation: Hamburger menu
- Touch-friendly buttons (minimum 44px)
- Optimized image sizes for mobile
- Swipe gestures for galleries

## 🔧 Admin Panel Design (EXACT LAYOUT)
```css
Sidebar: Dark gray (#1f2937) background
Active Menu: Pink highlight (#ec4899)
Content Area: Light gray background (#f9fafb)
Tables: White background with gray borders
Action Buttons: Pink for approve, red for reject
```

### Admin Sections
1. Dashboard - Overview cards with statistics
2. Campaigns - Table with status badges
3. Users - User management with ban/unban
4. Pricing - Dynamic price controls
5. Content - Homepage content editor
6. Design Samples - Upload and manage designs

## 🎨 Color Palette (EXACT COLORS)
```css
Primary Pink: #ec4899
Secondary Purple: #8b5cf6  
Dark Background: #1f2937
Light Gray: #f9fafb
Text Gray: #6b7280
Success Green: #10b981
Error Red: #ef4444
Warning Orange: #f59e0b
```

## 📝 Typography (EXACT FONTS)
```css
Font Family: Inter, system-ui, sans-serif
Headings: font-bold, text-2xl to text-4xl
Body Text: font-normal, text-sm to text-base
Buttons: font-medium, text-sm
Labels: font-medium, text-xs uppercase
```

## 🖼️ Image Specifications
- Logo: Transparent PNG, max 200px width
- Bottle Samples: Square aspect ratio, 300x300px
- Design Samples: A3 ratio, max 15MB
- Home Images: 16:9 aspect ratio for banners

## 📋 Form Design (EXACT STYLING)
```css
Input Fields: 
- Border: gray-300, focus:pink-500
- Padding: px-3 py-2
- Border radius: rounded-md
- Background: white

Buttons:
- Primary: bg-pink-500 hover:bg-pink-600
- Secondary: bg-gray-500 hover:bg-gray-600
- Danger: bg-red-500 hover:bg-red-600

Labels:
- Font: font-medium text-gray-700
- Margin: mb-1
```

## 🎯 Campaign Studio Design
```css
Steps Layout: Horizontal stepper with pink progress
Upload Area: Dashed border, drag-and-drop zone
Preview Section: Dark background with bottle mockup
Price Calculator: Fixed sidebar with live updates
Form Sections: Grouped with clear headings
```

## 📱 Dashboard Design (USER)
```css
Header: Dark gradient with user info
Quick Actions: Pink button cards
Recent Campaigns: Card layout with status badges
Statistics: Circular progress indicators
Navigation: Bottom tab bar for mobile
```

## 🔒 Authentication Pages
```css
Login/Signup: Centered form on dark background
Input Styling: White background, pink focus
Social Login: Outlined buttons with icons
Error Messages: Red text, small font
Success Messages: Green text with checkmark
```

## 📊 Data Display Rules
- Tables: Striped rows, hover effects
- Status Badges: Colored pills (green=success, orange=pending, red=failed)
- Loading States: Pink spinner animations
- Empty States: Illustration with helpful text
- Error States: Red color scheme with retry buttons

## 🎨 Animation Specifications
```css
Transitions: transition-all duration-200 ease-in-out
Hover Effects: transform hover:scale-105
Loading: animate-spin for spinners
Fade In: animate-fade-in for page loads
Slide Up: animate-slide-up for modals
```

## 💡 Interactive Elements
- Buttons: Hover state with subtle shadow
- Cards: Hover state with slight lift
- Images: Hover state with overlay
- Links: Underline on hover with pink color
- Modals: Backdrop blur with slide animation

## ⚠️ CRITICAL DESIGN RULES
1. **NO COLOR CHANGES**: Use exact hex colors specified
2. **NO LAYOUT CHANGES**: Maintain grid and spacing
3. **NO FONT CHANGES**: Keep Inter font family
4. **NO ANIMATION CHANGES**: Use specified transitions
5. **NO SPACING CHANGES**: Maintain Tailwind spacing classes

## 🎯 Component Library Usage
All components MUST use shadcn/ui components:
- Button, Card, Dialog, Form, Input, Label
- Table, Badge, Avatar, Separator
- Select, Checkbox, Switch, Textarea
- Alert, Toast, Tooltip, Popover

## 📐 Layout Grid System
```css
Container: max-w-7xl mx-auto px-4
Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
Spacing: gap-4 md:gap-6 lg:gap-8
Padding: p-4 md:p-6 lg:p-8
Margin: mb-4 md:mb-6 lg:mb-8
```

## 🔧 Responsive Breakpoints
- Mobile: < 640px (1 column layout)
- Tablet: 640px - 1024px (2 column layout)  
- Desktop: > 1024px (3+ column layout)
- Large: > 1280px (max width container)

## ✅ Design Verification Checklist
- [ ] Pink/purple color scheme maintained
- [ ] Dark backgrounds with white text
- [ ] Gradient buttons and headers
- [ ] Responsive mobile design
- [ ] Admin panel dark sidebar
- [ ] Form styling with pink focus
- [ ] Card layouts with hover effects
- [ ] Status badges with correct colors
- [ ] Loading animations working
- [ ] Typography hierarchy correct

**RESULT: Following these specifications will create the EXACT same website design.**