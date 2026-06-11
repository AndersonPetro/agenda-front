import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../core/integration/appointment/appointment.service';
import { AuthService } from '../../core/integration/auth/auth.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="page-header">
      <h2>Meus Agendamentos</h2>
      <p class="subtitle">Acompanhe seus próximos serviços.</p>
    </div>

    <div *ngIf="isLoading" class="loading">Carregando agendamentos...</div>
    
    <div *ngIf="!isLoading && appointments.length === 0" class="empty-state glass-card">
      <div class="icon">📅</div>
      <h3>Você ainda não tem agendamentos</h3>
      <p>Que tal marcar um serviço agora?</p>
      <a href="/book" class="btn-primary mt-2 d-inline-block">Agendar Serviço</a>
    </div>

    <div class="appointments-list">
      <div class="glass-card appointment-card" *ngFor="let appt of appointments" [ngClass]="appt.status.toLowerCase()">
        <div class="appt-date">
          <div class="day">{{ appt.scheduledAt | date:'dd' }}</div>
          <div class="month">{{ appt.scheduledAt | date:'MMM' }}</div>
          <div class="time">{{ appt.scheduledAt | date:'HH:mm' }}</div>
        </div>
        
        <div class="appt-details">
          <h4>{{ appt.serviceName || appt.service?.name || 'Serviço' }}</h4>
          <p class="status-badge" [ngClass]="appt.status.toLowerCase()">
            {{ getStatusText(appt.status) }}
          </p>
          <p class="notes" *ngIf="appt.notes">📝 {{ appt.notes }}</p>
        </div>

        <div class="appt-actions" *ngIf="appt.status === 'SCHEDULED'">
          <button class="btn-secondary cancel-btn" (click)="cancel(appt.id)">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-header h2 { font-size: 1.8rem; }
    
    .empty-state {
      text-align: center;
      padding: 3rem;
    }
    .empty-state .icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-secondary); margin-bottom: 1.5rem; }
    .d-inline-block { display: inline-block; }
    .mt-2 { margin-top: 1rem; }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .appointment-card {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      gap: 1.5rem;
      border-left: 4px solid var(--accent-primary);
    }
    .appointment-card.cancelled { border-left-color: var(--danger); opacity: 0.7; }
    .appointment-card.completed { border-left-color: var(--success); }

    .appt-date {
      text-align: center;
      min-width: 80px;
      padding-right: 1.5rem;
      border-right: 1px solid var(--border-color);
    }
    .day { font-size: 1.8rem; font-weight: bold; line-height: 1; color: var(--text-primary); }
    .month { text-transform: uppercase; font-size: 0.875rem; color: var(--accent-primary); font-weight: 600; margin-bottom: 0.25rem; }
    .time { font-size: 0.875rem; color: var(--text-secondary); }

    .appt-details {
      flex-grow: 1;
    }
    .appt-details h4 { margin: 0 0 0.5rem 0; font-size: 1.2rem; }
    .notes { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem; }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      background: var(--bg-primary);
    }
    .status-badge.scheduled { background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); }
    .status-badge.completed { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .status-badge.cancelled { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

    .cancel-btn {
      color: var(--danger);
      border-color: rgba(239, 68, 68, 0.3);
    }
    .cancel-btn:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  `]
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);

  appointments: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.appointmentService.getUserAppointments(userId).subscribe({
        next: (data) => {
          this.appointments = data.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  getStatusText(status: string): string {
    const statusMap: any = {
      'SCHEDULED': 'Agendado',
      'COMPLETED': 'Concluído',
      'CANCELLED': 'Cancelado',
      'CONFIRMED': 'Confirmado'
    };
    return statusMap[status] || status;
  }

  cancel(id: string) {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      this.appointmentService.cancelAppointment(id).subscribe(() => {
        this.loadAppointments();
      });
    }
  }
}
