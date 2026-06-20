import {
  Component, inject, signal, computed, effect, input,
  ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import QRCodeStyling, { type Options, type DotType as LibDotType, type CornerSquareType as LibCornerT } from 'qr-code-styling';
import { StoreService } from '../../services/store.service';
import { FooterComponent } from '../../layout/footer/footer.component';

type DotT = LibDotType;
type CornerT = LibCornerT;
type ContentT = 'url' | 'text' | 'email' | 'phone' | 'whatsapp';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [RouterLink, FormsModule, FooterComponent],
  templateUrl: './qr-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrGeneratorComponent implements AfterViewInit {
  store = inject(StoreService);
  embedded = input(false);

  @ViewChild('qrCanvas') canvasRef!: ElementRef<HTMLDivElement>;

  // ── Content
  contentType  = signal<ContentT>('url');
  rawValue     = signal('https://supportconnecte.fr');

  // ── Style
  dotType      = signal<DotT>('rounded');
  cornerType   = signal<CornerT>('extra-rounded');

  // ── Colors
  fgColor      = signal('#2347E6');
  bgColor      = signal('#FFFFFF');
  useGradient  = signal(false);
  gradColor    = signal('#0FB57E');

  // ── Logo
  useLogo      = signal(false);
  logoUrl      = signal('');
  logoFileName = signal('');

  // ── Size
  size         = signal(300);
  qrMargin     = signal(10);

  // ── Dynamic mode
  isDynamic    = signal(false);
  qrName       = signal('');
  hasExpiry    = signal(false);
  expiryDate   = signal('');

  // ── Save state
  savedId      = signal('');
  copied       = signal(false);

  // ── Internal
  private qr!: QRCodeStyling;
  private ready = signal(false);

  readonly dotTypes: { type: DotT; label: string; preview: string }[] = [
    { type: 'square',        label: 'Carré',    preview: '⬛' },
    { type: 'rounded',       label: 'Arrondi',  preview: '🔲' },
    { type: 'dots',          label: 'Points',   preview: '⚫' },
    { type: 'classy',        label: 'Classy',   preview: '◆' },
    { type: 'classy-rounded', label: 'Élégant', preview: '◈' },
    { type: 'extra-rounded', label: 'Ultra',    preview: '●' },
  ];

  readonly cornerTypes: { type: CornerT; label: string }[] = [
    { type: 'square',        label: 'Carré' },
    { type: 'extra-rounded', label: 'Arrondi' },
    { type: 'dot',           label: 'Point' },
  ];

  readonly contentTypes: { value: ContentT; label: string }[] = [
    { value: 'url',       label: '🔗 URL' },
    { value: 'text',      label: '📝 Texte' },
    { value: 'email',     label: '✉️ Email' },
    { value: 'phone',     label: '📞 Tél' },
    { value: 'whatsapp',  label: '💬 WhatsApp' },
  ];

  contentPlaceholder = computed(() => ({
    url:       'https://votresite.fr',
    text:      'Votre message ici…',
    email:     'contact@votresite.fr',
    phone:     '+33 6 00 00 00 00',
    whatsapp:  '+33 6 00 00 00 00',
  }[this.contentType()]));

  qrData = computed(() => {
    if (this.isDynamic() && this.savedId()) {
      return `${window.location.origin}/r/${this.savedId()}`;
    }
    const v = this.rawValue();
    switch (this.contentType()) {
      case 'email':     return `mailto:${v}`;
      case 'phone':     return `tel:${v.replace(/\s/g, '')}`;
      case 'whatsapp':  return `https://wa.me/${v.replace(/[\s+]/g, '')}`;
      default:          return v;
    }
  });

  shortUrl = computed(() => `${window.location.origin}/r/${this.savedId()}`);

  private opts = computed((): Options => {
    const base: Options = {
      width:  this.size(),
      height: this.size(),
      data:   this.qrData(),
      margin: this.qrMargin(),
      dotsOptions: {
        type: this.dotType(),
        ...(this.useGradient()
          ? { gradient: { type: 'linear' as const, rotation: 45, colorStops: [{ offset: 0, color: this.fgColor() }, { offset: 1, color: this.gradColor() }] } }
          : { color: this.fgColor() }
        )
      },
      cornersSquareOptions: { type: this.cornerType(), color: this.fgColor() },
      cornersDotOptions:    { color: this.fgColor() },
      backgroundOptions:    { color: this.bgColor() },
      qrOptions:            { errorCorrectionLevel: 'M' },
    };
    if (this.useLogo() && this.logoUrl()) {
      base.image = this.logoUrl();
      base.imageOptions = { crossOrigin: 'anonymous', margin: 5 };
    }
    return base;
  });

  constructor() {
    effect(() => {
      const opts = this.opts();
      if (!this.ready()) return;
      this.qr.update(opts);
    });
  }

  ngAfterViewInit() {
    this.qr = new QRCodeStyling(this.opts());
    this.qr.append(this.canvasRef.nativeElement);
    this.ready.set(true);
  }

  setContentType(t: ContentT) {
    this.contentType.set(t);
    this.rawValue.set('');
  }

  toggleDynamic() {
    this.isDynamic.update(v => !v);
    this.savedId.set('');
  }

  downloadPng() { this.qr.download({ name: 'qrcode-sc', extension: 'png' }); }
  downloadSvg() { this.qr.download({ name: 'qrcode-sc', extension: 'svg' }); }

  async saveDynamic() {
    const id = await this.store.createQrCode({
      name:        this.qrName() || 'QR Code ' + new Date().toLocaleDateString('fr-FR'),
      destination: this.rawValue(),
      active:      true,
      expiresAt:   this.hasExpiry() && this.expiryDate() ? this.expiryDate() : null,
      style: {
        dotType:      this.dotType(),
        cornerType:   this.cornerType(),
        fgColor:      this.fgColor(),
        bgColor:      this.bgColor(),
        useGradient:  this.useGradient(),
        gradientColor: this.gradColor(),
        size:         this.size(),
        margin:       this.qrMargin(),
      }
    });
    this.savedId.set(id);
  }

  onLogoUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.logoFileName.set(file.name);
    const reader = new FileReader();
    reader.onload = (e) => this.logoUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeLogo() {
    this.logoUrl.set('');
    this.logoFileName.set('');
  }

  async copyUrl() {
    await navigator.clipboard.writeText(this.shortUrl());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  get todayMin() {
    return new Date().toISOString().split('T')[0];
  }
}
