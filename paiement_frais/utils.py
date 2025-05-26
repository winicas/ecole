import qrcode
from io import BytesIO
import base64

def generate_qr_code(data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    byte_io = BytesIO()
    img.save(byte_io, 'PNG')
    byte_io.seek(0)

    img_base64 = base64.b64encode(byte_io.getvalue()).decode('utf-8')
    
    return img_base64

