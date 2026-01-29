import { NextRequest, NextResponse } from 'next/server';
import { decryptCookie } from '@/lib/utils/server-cookie-decrypt';
import { cookies } from 'next/headers';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('_u');

    if (!userCookie?.value) {
      return NextResponse.json(
        { status: false, message: 'Cookie _u not found', data: null },
        { status: 404 }
      );
    }

    try {
      // Giải mã cookie
      const decryptedUser = decryptCookie(userCookie.value);
      const userData = JSON.parse(decryptedUser);

      return NextResponse.json({
        status: true,
        message: 'Success',
        data: userData,
        statusCode: 200,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          status: false,
          message: `Decryption failed: ${error.message}`,
          data: null,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        message: error?.message || 'Lỗi không xác định khi xử lý request',
        data: null,
      },
      { status: 500 }
    );
  }
}
