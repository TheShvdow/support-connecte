import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../services/store.service';
import { OPTS } from '../../../data/data';
import { Demande } from '../../../models/types';

@Component({
  selector: 'app-slide-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="panel-overlay" [class.open]="open()" (click)="close()"></div>
    <div class="slide-panel" [class.open]="open()">
      @if (demande()) {
        <div class="panel-header">
          <h3>Demande {{ demande()!.ref }}</h3>
          <button class="panel-close" (click)="close()">×</button>
        </div>
        <div class="panel-body">
          <div class="panel-field"><label>Référence</label><div class="val cobalt">{{ demande()!.ref }}</div></div>
          <div class="panel-field"><label>Client</label><div class="val">{{ demande()!.client }}</div></div>
          <div class="panel-field"><label>Détail</label><div class="val">{{ demande()!.detail }}</div></div>
          <div class="panel-field"><label>Type</label><div class="val">{{ demande()!.type }}</div></div>
          <div class="panel-field"><label>Date</label><div class="val">{{ demande()!.date }}</div></div>
          @if (demande()!.email) {
            <div class="panel-field"><label>Email</label>
              <div class="val"><a [href]="'mailto:' + demande()!.email" class="cobalt">{{ demande()!.email }}</a></div>
            </div>
          }
          @if (demande()!.tel) {
            <div class="panel-field"><label>Téléphone</label><div class="val">{{ demande()!.tel }}</div></div>
          }
          <div class="panel-divider"></div>
          <div class="panel-field">
            <label>{{ store.t().statut }}</label>
            <select [(ngModel)]="editStatut">
              @for (s of statutOptions; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>
          <div class="panel-field">
            <label>{{ store.t().notes }}</label>
            <textarea rows="4" [(ngModel)]="editNotes"></textarea>
          </div>
        </div>
        <div class="panel-footer">
          <button class="panel-cancel" (click)="close()">{{ store.t().cancel }}</button>
          <button class="panel-save" (click)="save()">{{ store.t().save }}</button>
        </div>
      }
    </div>
  `
})
export class SlidePanelComponent {
  store = inject(StoreService);
  open = signal(false);
  demande = signal<Demande | null>(null);
  editStatut = '';
  editNotes = '';
  statutOptions = OPTS.statutOptions;

  openWith(d: Demande) {
    this.demande.set(d);
    this.editStatut = d.statut;
    this.editNotes = d.notes;
    this.open.set(true);
  }

  close() { this.open.set(false); }

  save() {
    const d = this.demande();
    if (d) this.store.saveDemande(d.id, this.editStatut, this.editNotes);
    this.close();
  }
}
