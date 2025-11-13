import { NextResponse } from 'next/server';
import { getServiceSupabase } from '../../../../lib/supabaseClient';

export async function POST(req: Request) {
  const svc = getServiceSupabase();
  try {
    const authHeader = req.headers.get('authorization');
    const { requireDriver } = await import('../../../../lib/auth');
    const driverCheck = await requireDriver(authHeader);
    if (driverCheck.error) return NextResponse.json({ error: driverCheck.error }, { status: driverCheck.error === 'driver_not_verified' ? 403 : 401 });

    const body = await req.json();
    const { driver_id, filename, content_type } = body;
    if (!driver_id || !filename) return NextResponse.json({ error: 'missing' }, { status: 400 });
    // Ensure driver_id matches authenticated driver
    if (driverCheck.driver.id !== driver_id) return NextResponse.json({ error: 'driver_mismatch' }, { status: 403 });

    // Create a path for the driver's document
    const path = `driver-docs/${driver_id}/${Date.now()}-${filename}`;
    // Attempt to create a signed upload URL (requires service role key and supported by Supabase storage)
    try {
      const res = await svc.storage.from('driver-docs').createSignedUploadUrl(path, 60);
      if (res?.signedURL) {
        // record document metadata in driver_documents table with placeholder url (public URL will be created after upload)
        await svc.from('driver_documents').insert({ driver_id, type: filename.split('.').pop(), url: path, uploaded_at: new Date().toISOString() });
        return NextResponse.json({ uploadUrl: res.signedURL, path });
      }
      return NextResponse.json({ error: 'upload_not_supported' }, { status: 400 });
    } catch (err:any) {
      // Fallback: instruct client to upload directly to Supabase Storage using anon key
      return NextResponse.json({ error: 'signed_url_failed', message: err.message, instruction: 'Upload via client using Supabase Storage with anon key or contact admin.' }, { status: 500 });
    }
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
