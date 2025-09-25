import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bnwbjrlgoylmbblfmsru.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjY4NDEsImV4cCI6MjA3MjU0Mjg0MX0.EqX0rxmgtsl_WOBfyOY1nQ-7sL8QXTKXX5TirrmvIrA'
);

try {
  const { data, error } = await supabase
    .from('products')
    .select('signal_word, hazard_class, packing_group');

  if (error) throw error;

  console.log('Signal words:', [...new Set(data.map(d => d.signal_word).filter(x => x))]);
  console.log('Hazard classes:', [...new Set(data.map(d => d.hazard_class).filter(x => x))]);
  console.log('Packing groups:', [...new Set(data.map(d => d.packing_group).filter(x => x))]);
  
} catch (error) {
  console.error('Error:', error);
}