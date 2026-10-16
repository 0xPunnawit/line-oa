export class LgsDonateDecryptedResponseDto {
  status_code: string;
  status_desc: string;
  lgs_lead_id: string;
  req_id: string;

  constructor(
    statusCode: string,
    statusDesc: string,
    lgsLeadId: string,
    reqId: string,
  ) {
    this.status_code = statusCode;
    this.status_desc = statusDesc;
    this.lgs_lead_id = lgsLeadId;
    this.req_id = reqId;
  }
}
