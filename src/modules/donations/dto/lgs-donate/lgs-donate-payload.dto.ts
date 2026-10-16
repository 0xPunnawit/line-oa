export class LgsDonatePayloadDto {
  lgs_product_request: string;
  lgs_name: string;
  lgs_surname: string;
  lgs_mobile_no: string;
  lgs_comment: string;
  lgs_remark: string;

  constructor(
    productRequest: string,
    name: string,
    surname: string,
    mobileNo: string,
    comment: string,
    remark: string,
  ) {
    this.lgs_product_request = productRequest;
    this.lgs_name = name;
    this.lgs_surname = surname;
    this.lgs_mobile_no = mobileNo;
    this.lgs_comment = comment;
    this.lgs_remark = remark;
  }
}
