import { LabelEditor } from '@/components/LabelEditor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Label Editor | SpecChem',
  description: 'Edit label templates with live preview',
};

export default function LabelEditorPage() {
  return <LabelEditor />;
}