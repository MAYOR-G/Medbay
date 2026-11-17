-- ============================================================================
-- MedBay Local Development Seed Data (supabase/seed.sql)
-- Aligned 1:1 with DATABASE.md Section 11.2
-- ============================================================================

DO $$
DECLARE
  v_user_id UUID := '11111111-1111-4111-8111-111111111111';
  v_self_id UUID := '22222222-2222-4222-8222-222222222201';
  v_sarah_id UUID := '22222222-2222-4222-8222-222222222202';
  v_david_id UUID := '22222222-2222-4222-8222-222222222203';
  v_doc_self_id UUID := '33333333-3333-4333-8333-333333333301';
  v_doc_david_id UUID := '33333333-3333-4333-8333-333333333302';
  v_sample_embedding extensions.vector(1536);
BEGIN
  v_sample_embedding := array_fill(0.01::float4, ARRAY[1536])::extensions.vector(1536);

  -- 1. Seed Auth & Application User
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo.caregiver@medbay.test',
    '',
    now(),
    '{"provider": "google", "providers": ["google"]}'::jsonb,
    '{"full_name": "Alex Morgan"}'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.users (id, email, full_name, google_scopes_valid, gmail_scan_enabled)
  VALUES (v_user_id, 'demo.caregiver@medbay.test', 'Alex Morgan', true, true)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Seed Family Profiles (Self, Sarah, David)
  INSERT INTO public.family_profiles (id, user_id, full_name, relationship, date_of_birth, is_primary, color_index)
  VALUES
    (v_self_id, v_user_id, 'Alex Morgan', 'Self', '1988-04-12', true, 0),
    (v_sarah_id, v_user_id, 'Sarah Morgan', 'Spouse', '1990-07-21', false, 1),
    (v_david_id, v_user_id, 'David Morgan', 'Child', '2019-09-03', false, 2)
  ON CONFLICT (id) DO NOTHING;

  -- 3. Seed Sample Ready Medical Documents
  INSERT INTO public.medical_documents (
    id,
    user_id,
    profile_id,
    title,
    original_filename,
    mime_type,
    file_size_bytes,
    storage_path,
    category,
    document_date,
    detected_patient_name,
    profile_match_confidence,
    ingestion_status,
    extracted_text,
    source
  ) VALUES
    (
      v_doc_self_id,
      v_user_id,
      v_self_id,
      'Annual Lipid & Metabolic Panel',
      'annual-lipid-panel.pdf',
      'application/pdf',
      245120,
      '11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333301/annual-lipid-panel.pdf',
      'Lab Report',
      '2026-10-14',
      'Alex Morgan',
      'high',
      'ready',
      'Patient: Alex Morgan. Comprehensive Lipid Panel. Total Cholesterol: 212 mg/dL. LDL Cholesterol: 138 mg/dL (Borderline High, ref < 100 mg/dL). HDL Cholesterol: 54 mg/dL (Normal). Triglycerides: 110 mg/dL (Normal). Fasting Glucose: 91 mg/dL (Normal).',
      'manual_upload'
    ),
    (
      v_doc_david_id,
      v_user_id,
      v_david_id,
      'Pediatric Immunization Record',
      'david-immunization-record.pdf',
      'application/pdf',
      184320,
      '11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333302/david-immunization-record.pdf',
      'Vaccination',
      '2026-09-20',
      'David Morgan',
      'high',
      'ready',
      'Patient: David Morgan (DOB 2019-09-03). Pediatric Immunization Summary. DTaP booster administered. MMR dose 2 verified. Seasonal influenza vaccine completed with no adverse reaction.',
      'manual_upload'
    )
  ON CONFLICT (id) DO NOTHING;

  -- 4. Seed Document Summaries
  INSERT INTO public.document_summaries (
    document_id,
    user_id,
    overview,
    key_findings,
    doctor_questions,
    citations,
    model_used
  ) VALUES
    (
      v_doc_self_id,
      v_user_id,
      'This routine fasting blood panel checks cholesterol and blood sugar levels. Most markers, including HDL cholesterol, triglycerides, and fasting glucose, are in the normal range. LDL ("bad") cholesterol is mildly elevated at 138 mg/dL, which warrants discussion at your next check-up.',
      '[
        {"label": "LDL Cholesterol", "value": "138 mg/dL", "severity": "attention", "explanation": "Mildly above the optimal target of under 100 mg/dL."},
        {"label": "Fasting Glucose", "value": "91 mg/dL", "severity": "normal", "explanation": "Within healthy fasting blood sugar limits."},
        {"label": "HDL Cholesterol", "value": "54 mg/dL", "severity": "normal", "explanation": "Healthy protective cholesterol level."}
      ]'::jsonb,
      '[
        "Should we repeat my lipid panel after 3 months of dietary adjustments?",
        "Given my age and overall health, what target LDL level should I aim for?"
      ]'::jsonb,
      '[
        {"title": "High Cholesterol — MedlinePlus", "url": "https://medlineplus.gov/cholesterol.html", "domain": "medlineplus.gov", "snippet": "LDL cholesterol is sometimes called bad cholesterol because high levels lead to plaque buildup in arteries."}
      ]'::jsonb,
      'deepseek/deepseek-v4.1-flash'
    ),
    (
      v_doc_david_id,
      v_user_id,
      'This pediatric immunization summary confirms David is up to date on his school-age booster shots, including DTaP, MMR dose 2, and the seasonal flu vaccine. No adverse reactions were recorded during the clinic visit.',
      '[
        {"label": "DTaP & MMR Boosters", "value": "Completed", "severity": "normal", "explanation": "Childhood immunization schedule is current."},
        {"label": "Seasonal Influenza", "value": "Administered", "severity": "normal", "explanation": "Annual flu protection documented."}
      ]'::jsonb,
      '[
        "When is David due for his next routine pediatric check-up or booster?"
      ]'::jsonb,
      '[
        {"title": "Child and Adolescent Immunization Schedule — CDC", "url": "https://www.cdc.gov/vaccines/schedules/", "domain": "cdc.gov", "snippet": "Recommended routine childhood vaccination schedule for children aged 4 to 6 years."}
      ]'::jsonb,
      'deepseek/deepseek-v4.1-flash'
    )
  ON CONFLICT (document_id) DO NOTHING;

  -- 5. Seed Sample Document Chunks
  INSERT INTO public.document_chunks (document_id, user_id, profile_id, chunk_index, content, embedding)
  VALUES
    (
      v_doc_self_id,
      v_user_id,
      v_self_id,
      0,
      'Patient: Alex Morgan. Comprehensive Lipid Panel. Total Cholesterol: 212 mg/dL. LDL Cholesterol: 138 mg/dL (Borderline High). HDL Cholesterol: 54 mg/dL. Triglycerides: 110 mg/dL. Fasting Glucose: 91 mg/dL.',
      v_sample_embedding
    ),
    (
      v_doc_david_id,
      v_user_id,
      v_david_id,
      0,
      'Patient: David Morgan. Pediatric Immunization Summary. DTaP booster administered. MMR dose 2 verified. Seasonal influenza vaccine completed.',
      v_sample_embedding
    )
  ON CONFLICT (document_id, chunk_index) DO NOTHING;

  -- 6. Seed Sample Activity Events
  IF NOT EXISTS (SELECT 1 FROM public.activity_events WHERE user_id = v_user_id) THEN
    INSERT INTO public.activity_events (user_id, profile_id, document_id, event_type, description, metadata)
    VALUES
      (v_user_id, v_self_id, v_doc_self_id, 'DOCUMENT_UPLOADED', 'Uploaded Annual Lipid & Metabolic Panel', '{"source": "manual_upload"}'::jsonb),
      (v_user_id, v_self_id, v_doc_self_id, 'AI_SUMMARY_GENERATED', 'Plain-English summary generated for Annual Lipid & Metabolic Panel', '{"model_used": "deepseek/deepseek-v4.1-flash"}'::jsonb),
      (v_user_id, v_self_id, NULL, 'CALENDAR_APPOINTMENT_BOOKED', 'Booked Primary Care Follow-Up on Google Calendar', '{"title": "Primary Care Follow-Up"}'::jsonb);
  END IF;

  -- 7. Seed Sample Unread Gmail Notification
  INSERT INTO public.notification_items (
    user_id,
    type,
    title,
    body,
    gmail_message_id,
    email_subject,
    email_sender,
    has_attachments,
    is_read
  ) VALUES (
    v_user_id,
    'gmail_medical_found',
    'New Lab Notice from Quest Diagnostics',
    'Your recent CBC & Vitamin D report is available for review.',
    'seed-gmail-msg-001',
    'Quest Diagnostics: Your Lab Results Are Ready',
    'results@questdiagnostics.com',
    true,
    false
  )
  ON CONFLICT (user_id, gmail_message_id) WHERE (gmail_message_id IS NOT NULL) DO NOTHING;
END $$;
