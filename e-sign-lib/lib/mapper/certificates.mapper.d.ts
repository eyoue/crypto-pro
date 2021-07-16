import { Certificate } from '@epsr/crypto-pro';
import { CertificateModel } from "../models";
export declare class CertificatesMapper {
    static map(src: Certificate): CertificateModel;
}
