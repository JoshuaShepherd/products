/**
 * Production CSS Constants for Label Templates
 * These are the CSS templates used in production for different label sizes
 */

export const PRODUCTION_14X7_CSS = `
/* 14x7 Inch Label CSS */
.label-container {
  width: 14in;
  height: 7in;
  padding: 0.25in;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
  background: white;
  color: black;
  display: flex;
  flex-direction: column;
  page-break-inside: avoid;
}

.label-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25in;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.2;
}

.product-description {
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.hazard-section {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.signal-word {
  font-size: 18px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.signal-word.danger {
  background-color: #ff0000;
  color: white;
}

.signal-word.warning {
  background-color: #ff8000;
  color: black;
}

.pictograms {
  display: flex;
  gap: 8px;
}

.pictogram {
  width: 32px;
  height: 32px;
}

.hazard-statements, .precautionary-statements {
  font-size: 12px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.label-footer {
  margin-top: auto;
  font-size: 10px;
  text-align: center;
  padding-top: 0.25in;
}

/* Print styles */
@media print {
  .label-container {
    margin: 0;
    page-break-after: always;
  }
}
`;

export const PRODUCTION_5X9_CSS = `
/* 5x9 Inch Label CSS */
.label-container {
  width: 5in;
  height: 9in;
  padding: 0.2in;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
  background: white;
  color: black;
  display: flex;
  flex-direction: column;
  page-break-inside: avoid;
}

.label-header {
  margin-bottom: 0.2in;
}

.product-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 6px;
  line-height: 1.2;
}

.product-description {
  font-size: 12px;
  margin-bottom: 10px;
  line-height: 1.3;
}

.hazard-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}

.signal-word {
  font-size: 14px;
  font-weight: bold;
  padding: 3px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

.signal-word.danger {
  background-color: #ff0000;
  color: white;
}

.signal-word.warning {
  background-color: #ff8000;
  color: black;
}

.pictograms {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pictogram {
  width: 24px;
  height: 24px;
}

.hazard-statements, .precautionary-statements {
  font-size: 10px;
  margin-bottom: 8px;
  line-height: 1.3;
}

.label-footer {
  margin-top: auto;
  font-size: 8px;
  text-align: center;
  padding-top: 0.15in;
}

/* Print styles */
@media print {
  .label-container {
    margin: 0;
    page-break-after: always;
  }
}
`;

export const CSS_TEMPLATES = {
  '14x7': PRODUCTION_14X7_CSS,
  '5x9': PRODUCTION_5X9_CSS
} as const;

export type LabelSize = keyof typeof CSS_TEMPLATES;
