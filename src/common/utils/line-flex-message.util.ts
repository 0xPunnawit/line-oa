export class LineFlexMessageUtil {
  static createReceiptSuccess(
    points: number,
    total: number,
  ): Record<string, unknown> {
    return {
      type: 'flex',
      altText: `คุณได้รับ +${points} พอยท์!`,
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '24px',
          paddingBottom: '16px',
          contents: [
            {
              type: 'text',
              text: `ยอดเงิน: ${total}`,
              color: '#FF6B6B',
              weight: 'bold',
              size: 'xl',
              align: 'center',
              margin: 'sm',
            },
            {
              type: 'text',
              text: `คุณได้รับ +${points} พอยท์`,
              color: '#FF6B6B',
              weight: 'bold',
              size: 'xl',
              align: 'center',
              margin: 'sm',
            },
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '24px',
          paddingTop: '0px',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#FAFAFA',
              cornerRadius: '12px',
              paddingAll: '16px',
              contents: [
                {
                  type: 'text',
                  text: '🎉 บันทึกใบเสร็จสำเร็จ',
                  weight: 'bold',
                  size: 'md',
                  color: '#444444',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: 'พอยท์ถูกเพิ่มเข้าบัญชีของคุณแล้ว',
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  align: 'center',
                  margin: 'md',
                },
              ],
            },
          ],
        },
        styles: {
          header: {
            backgroundColor: '#FFF5F5',
          },
        },
      },
    };
  }

  static createDonationConfirm(
    donateId: number,
    phoneNumber: string,
    points: number,
  ): Record<string, unknown> {
    const confirmPostbackData = JSON.stringify({
      action: 'confirm_donate',
      donateId,
      phoneNumber,
      points,
    });

    const cancelPostbackData = JSON.stringify({
      action: 'cancel_donate',
      donateId,
    });

    return {
      type: 'flex',
      altText: `ยืนยันการบริจาค ${points} พอยท์`,
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '24px',
          paddingBottom: '16px',
          contents: [
            {
              type: 'text',
              text: '🎁 บริจาคพอยท์',
              color: '#FF6B6B',
              weight: 'bold',
              size: 'xl',
              align: 'center',
              margin: 'sm',
            },
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '24px',
          paddingTop: '0px',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#FAFAFA',
              cornerRadius: '12px',
              paddingAll: '16px',
              spacing: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: 'เบอร์โทร',
                      color: '#888888',
                      size: 'sm',
                    },
                    {
                      type: 'text',
                      text: phoneNumber,
                      weight: 'bold',
                      size: 'md',
                      color: '#444444',
                      align: 'end',
                    },
                  ],
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: 'จำนวนพอยท์',
                      color: '#888888',
                      size: 'sm',
                    },
                    {
                      type: 'text',
                      text: `${points} พอยท์`,
                      weight: 'bold',
                      size: 'md',
                      color: '#FF6B6B',
                      align: 'end',
                    },
                  ],
                },
              ],
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '16px',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#FF6B6B',
              height: 'md',
              action: {
                type: 'postback',
                label: 'ยืนยันการบริจาค',
                data: confirmPostbackData,
              },
            },
            {
              type: 'button',
              style: 'secondary',
              height: 'md',
              action: {
                type: 'postback',
                label: 'ยกเลิก',
                data: cancelPostbackData,
              },
            },
          ],
        },
        styles: {
          header: {
            backgroundColor: '#FFF5F5',
          },
        },
      },
    };
  }
}
