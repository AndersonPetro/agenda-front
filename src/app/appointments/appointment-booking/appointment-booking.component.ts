import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../core/integration/appointment/appointment.service';
import { ServiceService } from '../../core/integration/service.service';
import { AuthService } from '../../core/integration/auth/auth.service';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="booking-container">
      <div class="page-header">
        <h2>Novo Agendamento</h2>
        <p class="subtitle">Escolha o serviço e o melhor horário para você.</p>
      </div>

      <div class="glass-card">
        <form [formGroup]="bookingForm" (ngSubmit)="bookAppointment()">
          <div class="form-group">
            <label>Selecione o Serviço</label>
            <select formControlName="serviceId" (change)="onServiceOrDateChange()">
              <option value="">-- Escolha um serviço --</option>
              <option *ngFor="let s of services" [value]="s.id">{{ s.name }} (R$ {{ s.price }})</option>
            </select>
          </div>

          <div class="form-group">
            <label>Data</label>
            <input type="date" formControlName="date" (change)="onServiceOrDateChange()" [min]="minDate">
          </div>

          <div class="form-group" *ngIf="availableSlots.length > 0">
            <label>Horários Disponíveis</label>
            <div class="slots-grid">
              <div 
                *ngFor="let slot of availableSlots" 
                class="slot-card"
                [class.selected]="selectedSlot === slot.startTime"
                (click)="selectSlot(slot.startTime)">
                {{ slot.startTime | slice:0:5 }}
              </div>
            </div>
          </div>

          <div *ngIf="showNoSlotsMsg" class="alert-error">
            Não há horários disponíveis para este dia.
          </div>

          <div class="form-group mt-4">
            <label>Observações (Opcional)</label>
            <textarea formControlName="notes" rows="2" placeholder="Alguma observação especial?"></textarea>
          </div>

          <button type="submit" class="btn-primary w-100" [disabled]="bookingForm.invalid || !selectedSlot || isSubmitting">
            {{ isSubmitting ? 'Agendando...' : 'Confirmar Agendamento' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .booking-container { max-width: 600px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; text-align: center; }
    .page-header h2 { font-size: 1.8rem; }
    .subtitle { color: var(--text-secondary); }
    .w-100 { width: 100%; margin-top: 1.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .slot-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 0.75rem;
      text-align: center;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
    }
    .slot-card:hover {
      border-color: var(--accent-primary);
      background: rgba(99, 102, 241, 0.1);
    }
    .slot-card.selected {
      background: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
      box-shadow: var(--shadow-glow);
    }
  `]
})
export class AppointmentBookingComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  services: any[] = [];
  availableSlots: any[] = [];
  selectedSlot: string | null = null;
  minDate: string;
  showNoSlotsMsg = false;
  isSubmitting = false;

  bookingForm: FormGroup = this.fb.group({
    serviceId: ['', Validators.required],
    date: ['', Validators.required],
    notes: ['']
  });

  constructor() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.serviceService.getServices().subscribe(data => this.services = data);
  }

  onServiceOrDateChange() {
    const { serviceId, date } = this.bookingForm.value;
    this.selectedSlot = null;
    this.availableSlots = [];
    this.showNoSlotsMsg = false;

    if (serviceId && date) {
      this.appointmentService.getAvailableSlots(date, serviceId).subscribe(slots => {
        this.availableSlots = slots.filter(s => s.available);
        if (this.availableSlots.length === 0) {
          this.showNoSlotsMsg = true;
        }
      });
    }
  }

  selectSlot(time: string) {
    this.selectedSlot = time;
  }

  bookAppointment() {
    if (this.bookingForm.valid && this.selectedSlot) {
      this.isSubmitting = true;
      const formValue = this.bookingForm.value;

      // Combine date and time
      const scheduledAt = `${formValue.date}T${this.selectedSlot}`;

      const payload = {
        userId: this.authService.getUserId(),
        serviceId: formValue.serviceId,
        scheduledAt: scheduledAt,
        notes: formValue.notes
      };

      this.appointmentService.createAppointment(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/appointments']);
        },
        error: () => this.isSubmitting = false
      });
    }
  }
}
