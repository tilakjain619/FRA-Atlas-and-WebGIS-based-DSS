# Land Governance Workflow System

A modern land governance workflow system built with Next.js, featuring OCR, GIS mapping, AI detection, blockchain, and decision support systems for administrative land management.

## Features

- **Document Upload & OCR**: Advanced document processing with NER
- **GIS Mapping**: Interactive maps with auto-geotagging
- **AI Anomaly Detection**: Risk heatmaps and intelligent analysis
- **Blockchain Integration**: QR-linked digital pattas
- **Decision Support System**: Officer dashboard with AR capabilities
- **Predictive Analytics**: Hotspot analysis and policy simulation

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── ui/               # Shadcn/ui components
│   └── figma/            # Figma integration components
├── styles/               # Global styles
│   └── globals.css       # Tailwind CSS configuration
└── guidelines/           # Project guidelines
```

## Workflow Steps

1. **Overview**: System dashboard and metrics
2. **Document Upload**: Drag-and-drop document processing
3. **OCR Data**: Extracted text and data analysis
4. **GIS Mapping**: Interactive mapping interface
5. **AI Detection**: Anomaly detection and risk analysis
6. **Blockchain Pattas**: Digital certificate management
7. **DSS Dashboard**: Decision support tools
8. **Predictive Analytics**: Trend analysis and forecasting

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Design System

The application uses a government-trustworthy design system with:
- **Primary Color**: Blue (#0052cc)
- **Background**: White
- **Accent**: Green (#39ff14)
- **Layout**: Card-based grid with responsive sidebar navigation

## Contributing

1. Follow the project guidelines in `/guidelines/Guidelines.md`
2. Use the established component patterns
3. Maintain responsive design principles
4. Test across different screen sizes