# HERBAFLOW - Smart Inventory System

## Brand Identity

### Logo
**HERBAFLOW** - Smart Inventory Management System for Herbalife
- Warehouse/building icon with green color scheme
- Modern, clean design
- Animated pulse dots for visual interest

### Color Palette (Green Herbalife Theme)

#### Primary Colors
- `#4b6043` - Dark Forest Green (Primary Dark)
- `#658354` - Forest Green (Primary)
- `#75975e` - Leaf Green (Primary Light)

#### Secondary Colors  
- `#87ab69` - Light Sage
- `#95bb72` - Soft Green
- `#b3cf99` - Pale Green
- `#c7ddb5` - Very Pale Green
- `#ddead1` - Lightest Green

#### Tailwind CSS Classes
```javascript
herbalife: {
  50: "#ddead1",   // Lightest
  100: "#c7ddb5",
  200: "#b3cf99",
  300: "#95bb72",
  400: "#87ab69",
  500: "#75975e",  // Main brand color
  600: "#658354",  // Darker brand
  700: "#4b6043",  // Darkest
  800: "#3d4f36",
  900: "#2f3d2a",
}
```

### Typography
- **Brand Name**: "HERBAFLOW" - Bold, uppercase, tracking-wider
- **Tagline**: "SMART INVENTORY" - Small caps, tracking-wide
- **Font**: Outfit (sans-serif)

### Components Using Brand Colors
- Primary buttons: `bg-herbalife-600 hover:bg-herbalife-700`
- Links: `text-herbalife-600 hover:text-herbalife-700`
- Logo accents: `fill-herbalife-500` to `fill-herbalife-700`
- Animated elements: `bg-herbalife-400`

### Dark Mode Support
- Primary button dark: `dark:bg-herbalife-500 dark:hover:bg-herbalife-600`
- Text dark: `dark:text-herbalife-300` to `dark:text-herbalife-400`

## Usage Examples

### Button
```tsx
<button className="bg-herbalife-600 hover:bg-herbalife-700 text-white">
  Action
</button>
```

### Link
```tsx
<a className="text-herbalife-600 hover:text-herbalife-700">
  Click here
</a>
```

### Logo Component
```tsx
import Logo from './components/common/Logo';

<Logo showText={true} />
```
