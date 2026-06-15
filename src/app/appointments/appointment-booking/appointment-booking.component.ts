import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../core/integration/appointment/appointment.service';
import { ServiceService } from '../../core/integration/service.service';
import { AuthService } from '../../core/integration/auth/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  template: `
    <div class="booking-container">
      <div class="page-header">
        <button *ngIf="dialogRef" class="close-btn" (click)="closeDialog()">&times;</button>
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
    .page-header { position: relative; margin-bottom: 2rem; text-align: center; }
    .page-header h2 { font-size: 1.8rem; }
    .subtitle { color: var(--text-secondary); }
    .w-100 { width: 100%; margin-top: 1.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    
    .close-btn {
      position: absolute;
      top: 0;
      right: 0;
      background: none;
      border: none;
      font-size: 1.75rem;
      cursor: pointer;
      color: var(--text-secondary);
      line-height: 1;
      padding: 0;
    }
    .close-btn:hover {
      color: var(--text-primary);
    }
    
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

    :host-context(.mat-mdc-dialog-container) .booking-container {
      max-width: 100%;
    }
    :host-context(.mat-mdc-dialog-container) .glass-card {
      border: none;
      box-shadow: none;
      padding: 0;
      background: transparent;
    }
  `]
})
export class AppointmentBookingComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public dialogRef = inject(MatDialogRef<AppointmentBookingComponent>, { optional: true });

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
    this.serviceService.getServices().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.services = data;
        } else {
          this.loadMockServices();
        }
      },
      error: () => {
        this.loadMockServices();
      }
    });
  }

  loadMockServices() {
    this.services = [
      { id: '1', name: 'Corte de Cabelo', price: 50.00, duration: '30 min', category: 'Cabelo' },
      { id: '2', name: 'Coloração', price: 150.00, duration: '90 min', category: 'Cabelo' },
      { id: '3', name: 'Manicure', price: 40.00, duration: '45 min', category: 'Unhas' },
      { id: '4', name: 'Barba', price: 35.00, duration: '30 min', category: 'Barba' }
    ];
  }

  onServiceOrDateChange() {
    const { serviceId, date } = this.bookingForm.value;
    this.selectedSlot = null;
    this.availableSlots = [];
    this.showNoSlotsMsg = false;

    if (serviceId && date) {
      this.appointmentService.getAvailableSlots(date, serviceId).subscribe({
        next: (slots) => {
          this.availableSlots = slots.filter(s => s.available);
          if (this.availableSlots.length === 0) {
            this.showNoSlotsMsg = true;
          }
        },
        error: () => {
          this.availableSlots = [
            { startTime: '09:00:00', available: true },
            { startTime: '10:00:00', available: true },
            { startTime: '11:00:00', available: true },
            { startTime: '14:00:00', available: true },
            { startTime: '15:00:00', available: true },
            { startTime: '16:00:00', available: true }
          ];
        }
      });
    }
  }



  selectSlot(time: string) {
    this.selectedSlot = time;
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  bookAppointment() {
    if (this.bookingForm.valid && this.selectedSlot) {
      this.isSubmitting = true;
      const formValue = this.bookingForm.value;

      // Combine date and time
      const scheduledAt = `${formValue.date}T${this.selectedSlot}`;

      const userId = this.authService.getUserId();
      if (!userId) {
        this.isSubmitting = false;
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        this.router.navigate(['/login']);
        return;
      }

      const payload = {
        userId: userId,
        serviceId: formValue.serviceId,
        scheduledAt: scheduledAt,
        notes: formValue.notes
      };

      this.appointmentService.createAppointment(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.appointmentService.notifyAppointmentCreated();
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.router.navigate(['/appointments']);
          }
        },
        error: () => {
          this.isSubmitting = false;

          const serviceObj = this.services.find(s => String(s.id) === String(formValue.serviceId));
          const mockAppt = {
            id: 'mock_' + Date.now(),
            userId: userId,
            serviceId: formValue.serviceId,
            serviceName: serviceObj ? serviceObj.name : 'Serviço',
            scheduledAt: scheduledAt,
            status: 'CONFIRMED',
            notes: formValue.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const existingMock = JSON.parse(localStorage.getItem('mock_appointments') || '[]');
          existingMock.push(mockAppt);
          localStorage.setItem('mock_appointments', JSON.stringify(existingMock));

          alert('Agendamento criado com sucesso (Modo offline/Mock)!');
          this.appointmentService.notifyAppointmentCreated();
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.router.navigate(['/appointments']);
          }
        }
      });
    }
  }
}
