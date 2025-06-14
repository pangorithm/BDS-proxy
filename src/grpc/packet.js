import * as path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { options } from '../config.js';

// 프로토콜 파일 로드 옵션
const PROTO_PATH = path.resolve(__dirname, '../../BDS-proto/packet.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, // 필드명을 원래 proto 정의대로 유지
  longs: String, // int64/uint64를 string으로 처리 (BigInt 대신)
  enums: String, // enum을 string으로 처리
  defaults: true, // 필드 기본값 설정
  oneofs: true,
});

// 메타데이터 생성
const metadata = new grpc.Metadata();
metadata.add('authorization', `Bearer ${process.env.AUTHORIZATION}`);
console.log(metadata.get('authorization'));

// 패키지 로드
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const packetPackage = protoDescriptor.packet; // example 패키지명

// 클라이언트 생성
const client = new packetPackage.PacketLoggingService(
  options.grpc_server,
  grpc.credentials.createInsecure(),
);

// Promise로 RPC 호출 래핑
export function put(request) {
  return new Promise((resolve, reject) => {
    client.put(request, metadata, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}
