import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/integration/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cliente-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-agendamentos.component.html',
  styleUrls: ['./cliente-agendamentos.component.scss']
})
export class ClienteAgendamentosComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userName = '';
  successMsg = '';

  // Form selections
  selectedService: any = null;
  selectedProfessional = '';
  selectedDate = '2026-06-15';
  selectedSlot = '';

  // Options
  services = [
    { id: 1, name: 'Corte de Cabelo', duration: '30 min', price: 'R$ 50,00', category: 'Cabelo' },
    { id: 2, name: 'Coloração', duration: '90 min', price: 'R$ 150,00', category: 'Cabelo' },
    { id: 3, name: 'Manicure', duration: '45 min', price: 'R$ 40,00', category: 'Unhas' },
    { id: 4, name: 'Barba', duration: '30 min', price: 'R$ 35,00', category: 'Barba' }
  ];

  professionals = [
    'Carlos Silva (Especialista em Cabelo)',
    'Ana Oliveira (Especialista em Coloração)',
    'Marcos Souza (Manicure/Pedicure)'
  ];

  availableSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  // Scheduled appointments tracking
  myAppointments: any[] = [
    { id: 101, service: 'Corte de Cabelo', date: '15/06/2026', time: '10:00', professional: 'Carlos Silva', status: 'Agendado' }
  ];

  ngOnInit() {
    const user = this.authService.getUser();
    this.userName = user ? user.name : 'Cliente';
  }

  selectService(service: any) {
    this.selectedService = service;
    this.selectedSlot = ''; // Reset slot selection
  }

  selectSlot(slot: string) {
    this.selectedSlot = slot;
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
    
    // Reset selections
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
