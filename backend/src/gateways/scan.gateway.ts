import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ScanGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ScanGateway.name);

  emitScanProgress(data: {
    type: 'start' | 'progress' | 'complete' | 'error';
    repositoryName?: string;
    progress?: number;
    message?: string;
    error?: string;
  }) {
    this.logger.debug(`Emitting scan progress: ${JSON.stringify(data)}`);
    this.server.emit('scanProgress', data);
  }

  emitScanStart() {
    this.emitScanProgress({ type: 'start' });
  }

  emitRepositoryProgress(repositoryName: string, progress: number) {
    this.emitScanProgress({
      type: 'progress',
      repositoryName,
      progress,
    });
  }

  emitScanComplete() {
    this.emitScanProgress({ type: 'complete' });
  }

  emitScanError(error: string) {
    this.emitScanProgress({ type: 'error', error });
  }
}
