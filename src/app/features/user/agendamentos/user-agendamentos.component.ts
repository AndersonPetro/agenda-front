import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/integration/auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../core/integration/user/user.service';
import { AppointmentService } from '../../../core/integration/appointment/appointment.service';
import { ServiceService } from '../../../core/integration/service.service';
import { MaterialModule } from '../../../material/material.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@Component({
  selector: 'app-user-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
  templateUrl: './user-agendamentos.component.html',
  styleUrls: ['./user-agendamentos.component.scss']
})
export class UserAgendamentosComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);
  private serviceService = inject(ServiceService);

  userName = '';
  successMsg = '';

  activeTab = 'agendamentos';
  showBookingModal = false;

  // Profile Form State
  isUpdatingProfile = false;
  profileErrorMsg = '';
  profileSuccessMsg = '';
  profileData = {
    name: '',
    email: '',
    phone: ''
  };

  // Form selections
  selectedService: any = null;
  selectedProfessional = '';
  selectedDate = '2026-06-15';
  selectedDateObj: any = null;
  minDateObj = new Date();
  selectedSlot = '';

  // Options
  services: any[] = [
    { id: '1', name: 'Corte de Cabelo', duration: '30 min', price: 'R$ 50,00', category: 'Cabelo' },
    { id: '2', name: 'Coloração', duration: '90 min', price: 'R$ 150,00', category: 'Cabelo' },
    { id: '3', name: 'Manicure', duration: '45 min', price: 'R$ 40,00', category: 'Unhas' },
    { id: '4', name: 'Barba', duration: '30 min', price: 'R$ 35,00', category: 'Barba' }
  ];

  professionals = [
    'Carlos Silva (Especialista em Cabelo)',
    'Ana Oliveira (Especialista em Coloração)',
    'Marcos Souza (Manicure/Pedicure)'
  ];

  availableSlots: string[] = [];

  // Scheduled appointments tracking
  myAppointments: any[] = [];

  ngOnInit() {
    const user = this.authService.getUser();
    this.userName = user ? user.name : 'Cliente';
    if (user) {
      this.profileData.name = user.name || '';
      this.profileData.email = user.email || '';
      this.profileData.phone = user.phone || '';
    }
    this.loadServices();
    this.loadAppointments();

    this.appointmentService.appointmentCreated$.subscribe(() => {
      this.loadAppointments();
    });
  }

  selectTab(tabName: string) {
    this.activeTab = tabName;
    if (tabName === 'configuracoes') {
      const user = this.authService.getUser();
      if (user) {
        this.profileData = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        };
      }
      this.profileErrorMsg = '';
      this.profileSuccessMsg = '';
    }
  }

  updateProfile() {
    if (!this.profileData.email || !this.profileData.phone) {
      return;
    }

    this.isUpdatingProfile = true;
    this.profileErrorMsg = '';
    this.profileSuccessMsg = '';

    const userId = this.authService.getUserId() || '';
    const updatePayload = {
      name: this.profileData.name,
      email: this.profileData.email,
      phone: this.profileData.phone
    };

    this.userService.updateUser(userId, updatePayload).subscribe({
      next: (updatedUser) => {
        this.isUpdatingProfile = false;
        this.profileSuccessMsg = 'Cadastro atualizado com sucesso!';
        this.userName = updatedUser.name;

        // Update the user stored in localStorage
        const currentUser = this.authService.getUser();
        if (currentUser) {
          currentUser.name = updatedUser.name;
          currentUser.email = updatedUser.email;
          currentUser.phone = updatedUser.phone || '';
          localStorage.setItem('user', JSON.stringify(currentUser));
        }

        setTimeout(() => {
          this.profileSuccessMsg = '';
        }, 3000);
      },
      error: (err) => {
        this.isUpdatingProfile = false;
        console.error('Erro ao atualizar perfil:', err);

        if (userId === 'cliente-id' || userId === 'cliente@agenda.com') {
          // Fallback for mock environment
          this.profileSuccessMsg = 'Cadastro atualizado com sucesso (Mock)!';
          this.userName = this.profileData.name;

          const currentUser = this.authService.getUser();
          if (currentUser) {
            currentUser.email = this.profileData.email;
            currentUser.phone = this.profileData.phone;
            localStorage.setItem('user', JSON.stringify(currentUser));
          }

          setTimeout(() => {
            this.profileSuccessMsg = '';
          }, 3000);
        } else {
          this.profileErrorMsg = err.error?.message || 'Erro ao atualizar cadastro. Tente novamente.';
        }
      }
    });
  }

  selectService(service: any) {
    this.selectedService = service;
    this.selectedSlot = ''; // Reset slot selection
    this.onServiceOrDateChange();
  }

  onServiceChange(serviceId: string) {
    if (!serviceId) {
      this.selectedService = null;
    } else {
      const id = Number(serviceId);
      this.selectedService = this.services.find(s => s.id === id) || null;
    }
    this.selectedSlot = ''; // Reset slot selection
    this.selectedProfessional = ''; // Reset professional selection
    this.onServiceOrDateChange();
  }

  onServiceOrDateChange() {
    this.selectedSlot = '';
    this.availableSlots = [];

    if (this.selectedService && this.selectedDate) {
      this.appointmentService.getAvailableSlots(this.selectedDate, String(this.selectedService.id)).subscribe({
        next: (slots) => {
          this.availableSlots = slots
            .filter(s => s.available)
            .map(s => s.startTime.slice(0, 5));
        },
        error: () => {
          // Fallback to default mock slots
          this.availableSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        }
      });
    }
  }

  onDateChange(event: any) {
    const dateValue = event.value;
    if (dateValue && typeof dateValue.format === 'function') {
      this.selectedDate = dateValue.format('YYYY-MM-DD');
    } else if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      this.selectedDate = `${year}-${month}-${day}`;
    } else {
      this.selectedDate = '';
    }
    this.onServiceOrDateChange();
  }

  selectSlot(slot: string) {
    this.selectedSlot = slot;
  }

  openBookingModal() {
    this.selectedService = null;
    this.selectedProfessional = '';
    this.selectedSlot = '';
    this.selectedDate = '';
    this.selectedDateObj = null;
    this.availableSlots = [];
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
  }

  confirmBooking() {
    if (!this.selectedService || !this.selectedProfessional || !this.selectedDate || !this.selectedSlot) {
      return;
    }

    const newBooking = {
      id: Date.now(),
      service: this.selectedService.name,
      date: new Date(this.selectedDate).toLocaleDateString('pt-BR'),
      time: this.selectedSlot,
      professional: this.selectedProfessional.split(' (')[0],
      status: 'Agendado'
    };

    this.myAppointments.unshift(newBooking);
    this.successMsg = `Agendamento de ${this.selectedService.name} confirmado com sucesso para dia ${newBooking.date} às ${newBooking.time}!`;

    // Close modal and reset selections
    this.closeBookingModal();
    this.selectedService = null;
    this.selectedProfessional = '';
    this.selectedSlot = '';

    setTimeout(() => {
      this.successMsg = '';
    }, 4000);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'agendado' ? 'badge-scheduled' : 'badge-completed';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
