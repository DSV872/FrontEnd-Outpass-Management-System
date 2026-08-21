import api from '../api/axios';

// ─── Student ─────────────────────────────────────────────────────────────────

export interface StudentProfile {
    id: number;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    department: string;
    yearOfStudy: number;
    section: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    createdAt: string;
    updatedAt: string;
}

export interface StudentProfileUpdate {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    department: string;
    yearOfStudy: number;
    section: string;
}

export const getStudentProfile = (userId: string) =>
    api.get<StudentProfile>(`/profile-service/profiles/students/${userId}`).then(r => r.data);

export const updateStudentProfile = (userId: string, data: StudentProfileUpdate) =>
    api.put<StudentProfile>(`/profile-service/profiles/students/${userId}`, data).then(r => r.data);

// ─── Warden ──────────────────────────────────────────────────────────────────

export interface WardenProfile {
    id: number;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    hostelName: string;
    createdAt: string;
    updatedAt: string;
}

export interface WardenProfileUpdate {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    hostelName: string;
}

export const getWardenProfile = (userId: string) =>
    api.get<WardenProfile>(`/profile-service/profiles/wardens/${userId}`).then(r => r.data);

export const updateWardenProfile = (userId: string, data: WardenProfileUpdate) =>
    api.put<WardenProfile>(`/profile-service/profiles/wardens/${userId}`, data).then(r => r.data);

// ─── Security ────────────────────────────────────────────────────────────────

export interface SecurityProfile {
    id: number;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gateName: string;
    createdAt: string;
    updatedAt: string;
}

export interface SecurityProfileUpdate {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gateName: string;
}

export const getSecurityProfile = (userId: string) =>
    api.get<SecurityProfile>(`/profile-service/profiles/security/${userId}`).then(r => r.data);

export const updateSecurityProfile = (userId: string, data: SecurityProfileUpdate) =>
    api.put<SecurityProfile>(`/profile-service/profiles/security/${userId}`, data).then(r => r.data);
