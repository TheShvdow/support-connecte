import {
  Component, inject, input, output, signal,
  ViewChild, ElementRef, AfterViewInit, OnChanges
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import QRCodeStyling from 'qr-code-styling';
import Swal from 'sweetalert2';
import { StoreService } from '../../../services/store.service';
import { QrCode } from '../../../models/types';

@Component({
  selector: 'app-qr-detail',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './qr-detail.component.html',
})
export class QrDetailComponent implements AfterViewInit, OnChanges {
  store  = inject(StoreService);
  qr     = input.required<QrCode>();
  closed = output<void>();

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLDivElement>;
  private qrInstance!: QRCodeStyling;
  private ready = false;

  // ── Edit state
  editing      = signal(false);
  editName     = signal('');
  editDest     = signal('');
  editExpiry   = signal('');
  editMaxScans = signal<number | null>(null);

  copied = signal(false);

  shortUrl()  { return `${window.location.origin}/r/${this.qr().id}`; }

  isExpired() {
    const q = this.qr();
    return !!q.expiresAt && new Date(q.expiresAt) < new Date();
  }

  statusClass() {
    if (this.isExpired()) return 'badge-wait';
    return this.qr().active ? 'badge-done' : 'badge-new';
  }

  statusLabel() {
    if (this.isExpired()) return 'Expiré';
    return this.qr().active ? 'Actif' : 'Inactif';
  }

  get todayMin() { return new Date().toISOString().split('T')[0]; }

  ngAfterViewInit() {
    this.buildQr();
    this.ready = true;
  }

  ngOnChanges() {
    if (this.ready) this.buildQr();
  }

  private buildQr() {
    const q = this.qr();
    const s = (q.style ?? {}) as any;
    const opts = {
      width:  260, height: 260,
      data:   this.shortUrl(),
      margin: s.margin ?? 10,
      dotsOptions: {
        type: s.dotType ?? 'rounded',
        color: s.fgColor ?? '#2347E6',
        ...(s.useGradient ? {
          gradient: { type: 'linear' as const, rotation: 45,
            colorStops: [{ offset: 0, color: s.fgColor }, { offset: 1, color: s.gradientColor }] }
        } : {}),
      },
      cornersSquareOptions: { type: s.cornerType ?? 'extra-rounded', color: s.fgColor ?? '#2347E6' },
      cornersDotOptions:    { color: s.fgColor ?? '#2347E6' },
      backgroundOptions:    { color: s.bgColor ?? '#FFFFFF' },
      qrOptions:            { errorCorrectionLevel: 'M' as const },
    };

    if (!this.qrInstance) {
      this.qrInstance = new QRCodeStyling(opts);
      this.canvasRef.nativeElement.innerHTML = '';
      this.qrInstance.append(this.canvasRef.nativeElement);
    } else {
      this.qrInstance.update(opts);
    }
  }

  downloadPng() { this.qrInstance.download({ name: this.qr().id, extension: 'png' }); }
  downloadSvg() { this.qrInstance.download({ name: this.qr().id, extension: 'svg' }); }

  async copyLink() {
    await navigator.clipboard.writeText(this.shortUrl());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  toggle() { this.store.toggleQrCode(this.qr().id); }

  startEdit() {
    const q = this.qr();
    this.editName.set(q.name);
    this.editDest.set(q.destination);
    this.editExpiry.set(q.expiresAt ?? '');
    this.editMaxScans.set(q.maxScans);
    this.editing.set(true);
  }

  async saveEdit() {
    await this.store.updateQrCode(this.qr().id, {
      name:        this.editName(),
      destination: this.editDest(),
      expiresAt:   this.editExpiry() || null,
      maxScans:    this.editMaxScans(),
    });
    this.editing.set(false);
  }

  cancelEdit() { this.editing.set(false); }

  async deleteQr() {
    const result = await Swal.fire({
      title: 'Supprimer ce QR code ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF5B35',
      cancelButtonColor: '#9aa1ac',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
    });
    if (result.isConfirmed) {
      this.store.deleteQrCode(this.qr().id);
      this.closed.emit();
    }
  }
}
