import {
  Component, ChangeDetectionStrategy, input, output,
  signal, viewChild, ElementRef, afterNextRender,
} from '@angular/core';

@Component({
  selector: 'app-signature-pad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sp">
      <div class="sp__label">{{ label() }}</div>
      <div class="sp__canvas-wrap">
        <canvas #canvas class="sp__canvas" width="560" height="180"></canvas>
        @if (isEmpty()) {
          <div class="sp__hint">{{ hint() }}</div>
        }
      </div>
      <div class="sp__actions">
        <button type="button" class="sp__btn sp__btn--clear" (click)="clear()">Limpiar</button>
        <button type="button" class="sp__btn sp__btn--confirm"
          [disabled]="isEmpty()" (click)="confirm()">
          ✓ Confirmar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sp { display: flex; flex-direction: column; gap: var(--space-2); }

    .sp__label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }

    .sp__canvas-wrap {
      position: relative;
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      overflow: hidden;
      cursor: crosshair;
      &:hover { border-color: var(--color-primary-400); }
    }

    .sp__canvas {
      display: block;
      width: 100%;
      height: 180px;
      touch-action: none;
    }

    .sp__hint {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      pointer-events: none;
    }

    .sp__actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
    }

    .sp__btn {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-sm);
      border-radius: var(--radius-md);
      cursor: pointer;
      border: 1px solid var(--color-border);
      transition: all var(--transition-fast);
    }
    .sp__btn--clear {
      background: none;
      color: var(--color-text-muted);
      &:hover { color: var(--color-text-primary); border-color: var(--color-text-secondary); }
    }
    .sp__btn--confirm {
      background: var(--color-primary-600);
      color: white;
      border-color: var(--color-primary-600);
      &:hover:not(:disabled) { background: var(--color-primary-700); }
      &:disabled { opacity: 0.4; cursor: default; }
    }
  `],
})
export class SignaturePadComponent {
  readonly label    = input('Firma');
  readonly hint     = input('Dibuje aquí su firma');
  readonly confirmed = output<string>();

  protected readonly isEmpty = signal(true);

  private readonly canvasEl = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;

  constructor() {
    afterNextRender(() => {
      const canvas = this.canvasEl().nativeElement;
      this.ctx = canvas.getContext('2d');
      if (this.ctx) {
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth   = 2.5;
        this.ctx.lineCap     = 'round';
        this.ctx.lineJoin    = 'round';
      }
      // Register non-passive touch listeners to allow preventDefault (prevents scroll)
      canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
      canvas.addEventListener('touchmove',  this.onTouchMove,  { passive: false });
      canvas.addEventListener('touchend',   this.onTouchEnd,   { passive: true  });

      canvas.addEventListener('mousedown', this.onMouseDown);
      canvas.addEventListener('mousemove', this.onMouseMove);
      canvas.addEventListener('mouseup',   this.onMouseUp);
      canvas.addEventListener('mouseleave',this.onMouseUp);
    });
  }

  protected clear(): void {
    const canvas = this.canvasEl().nativeElement;
    this.ctx?.clearRect(0, 0, canvas.width, canvas.height);
    this.isEmpty.set(true);
  }

  protected confirm(): void {
    if (this.isEmpty()) return;
    const dataUrl = this.canvasEl().nativeElement.toDataURL('image/png');
    this.confirmed.emit(dataUrl);
  }

  // ── Mouse handlers ────────────────────────────────────────────────────────

  private readonly onMouseDown = (e: MouseEvent): void => {
    this.drawing = true;
    const { x, y } = this.getPos(e);
    this.ctx?.beginPath();
    this.ctx?.moveTo(x, y);
  };

  private readonly onMouseMove = (e: MouseEvent): void => {
    if (!this.drawing) return;
    const { x, y } = this.getPos(e);
    this.ctx?.lineTo(x, y);
    this.ctx?.stroke();
    this.isEmpty.set(false);
  };

  private readonly onMouseUp = (): void => { this.drawing = false; };

  // ── Touch handlers ────────────────────────────────────────────────────────

  private readonly onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    this.drawing = true;
    const { x, y } = this.getTouchPos(e.touches[0]);
    this.ctx?.beginPath();
    this.ctx?.moveTo(x, y);
  };

  private readonly onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (!this.drawing) return;
    const { x, y } = this.getTouchPos(e.touches[0]);
    this.ctx?.lineTo(x, y);
    this.ctx?.stroke();
    this.isEmpty.set(false);
  };

  private readonly onTouchEnd = (): void => { this.drawing = false; };

  // ── Coordinate helpers ────────────────────────────────────────────────────

  private getPos(e: MouseEvent): { x: number; y: number } {
    const canvas = this.canvasEl().nativeElement;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  private getTouchPos(touch: Touch): { x: number; y: number } {
    const canvas = this.canvasEl().nativeElement;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
  }
}
