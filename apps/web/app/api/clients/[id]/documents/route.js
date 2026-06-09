import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

// GET all documents for a client
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const clientId = parseInt(id);

    const documents = await sql`
      SELECT 
        id,
        client_id,
        file_name,
        file_path,
        file_type,
        file_size,
        uploaded_by,
        upload_date,
        created_at
      FROM client_documents
      WHERE client_id = ${clientId}
      ORDER BY upload_date DESC
    `;

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST new document
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const clientId = parseInt(id);
    const body = await request.json();
    
    const { file_name, file_path, file_type, file_size, uploaded_by } = body;

    if (!file_name || !file_path || !file_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [document] = await sql`
      INSERT INTO client_documents (
        client_id,
        file_name,
        file_path,
        file_type,
        file_size,
        uploaded_by
      ) VALUES (
        ${clientId},
        ${file_name},
        ${file_path},
        ${file_type},
        ${file_size || null},
        ${uploaded_by || null}
      )
      RETURNING *
    `;

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error creating document record:', error);
    return NextResponse.json(
      { error: 'Failed to create document record' },
      { status: 500 }
    );
  }
}

// DELETE document
export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM client_documents
      WHERE id = ${parseInt(documentId)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
