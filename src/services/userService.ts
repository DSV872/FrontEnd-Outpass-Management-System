import api from '../api/axios';

export interface UserDTO {
    id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: 'STUDENT' | 'PARENT' | 'WARDEN' | 'SECURITY' | 'ADMIN';
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
    phoneNumber?: string;
    department?: string;
    yearOfStudy?: number;
    section?: string;
    parentName?: string;
    parentEmail?: string;
    parentPhone?: string;
    hostelName?: string;
    gateName?: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

// Ensure proper fallbacks if the backend doesn't support pagination, we might receive an array directly
export type FetchUsersResponse = PaginatedResponse<UserDTO> | UserDTO[];

export interface FetchUsersParams {
    search?: string;
    role?: string;
    status?: 'ENABLED' | 'DISABLED';
    page?: number;
    size?: number;
}

export const userService = {
    /**
     * Fetch all users, with optional filtering/pagination
     */
    getUsers: async (params?: FetchUsersParams): Promise<FetchUsersResponse> => {
        // Fetch base auth data
        const authResponse = await api.get('/auth-service/auth/users', { headers: { 'X-Skip-Auth-Redirect': 'true' } });
        const authUsers = authResponse.data || [];

        // Fetch detailed profiles concurrently using all provided profile APIs
        const skipHeader = { headers: { 'X-Skip-Auth-Redirect': 'true' } };
        const [securityRes, studentsRes, wardensRes] = await Promise.allSettled([
            api.get('/profile-service/profiles/security', skipHeader),
            api.get('/profile-service/profiles/students', skipHeader),
            api.get('/profile-service/profiles/wardens', skipHeader)
        ]);

        // Build a lookup map of userId -> profileData for fast merging
        const profileMap = new Map<string, any>();

        const attachProfiles = (res: PromiseSettledResult<any>) => {
            if (res.status === 'fulfilled' && res.value?.data) {
                // Ensure res.value.data is iterable; some APIs might wrap data
                const items = Array.isArray(res.value.data) ? res.value.data : res.value.data.content || [];
                items.forEach((profile: any) => {
                    if (profile.userId) {
                        profileMap.set(profile.userId, profile);
                    }
                });
            }
        };

        attachProfiles(securityRes);
        attachProfiles(studentsRes);
        attachProfiles(wardensRes);

        // Merge profiles into Auth users
        let mergedUsers: UserDTO[] = authUsers.map((authUser: any) => {
            const profile = profileMap.get(authUser.userId);
            return {
                id: authUser.userId,
                userId: authUser.userId,
                email: authUser.email,
                role: authUser.role,
                enabled: authUser.enabled,
                firstName: profile?.firstName,
                lastName: profile?.lastName,
                phoneNumber: profile?.phoneNumber,
                department: profile?.department,
                yearOfStudy: profile?.yearOfStudy,
                section: profile?.section,
                parentName: profile?.parentName,
                parentEmail: profile?.parentEmail,
                parentPhone: profile?.parentPhone,
                hostelName: profile?.hostelName,
                gateName: profile?.gateName,
                createdAt: profile?.createdAt || ''
            };
        });

        // Client-side filtering logic for search, status, and role as the generic auth endpoint lacks query params mappings
        if (params?.role) {
            mergedUsers = mergedUsers.filter(u => u.role === params.role);
        }
        if (params?.status) {
            const isEnabled = (params.status === 'ENABLED');
            mergedUsers = mergedUsers.filter(u => u.enabled === isEnabled);
        }
        if (params?.search) {
            const s = params.search.toLowerCase();
            mergedUsers = mergedUsers.filter(u =>
                (u.email || '').toLowerCase().includes(s) ||
                (u.userId || '').toLowerCase().includes(s) ||
                (u.firstName || '').toLowerCase().includes(s) ||
                (u.lastName || '').toLowerCase().includes(s)
            );
        }

        // Return client-side paginated response matching PaginatedResponse interface
        const page = params?.page || 0;
        const size = params?.size || 10;
        const totalElements = mergedUsers.length;
        const content = mergedUsers.slice(page * size, (page + 1) * size);

        return {
            content,
            totalPages: Math.ceil(totalElements / size),
            totalElements,
            size,
            number: page
        };
    },

    /**
     * Fetch user by ID
     */
    getUserById: async (userId: string): Promise<UserDTO> => {
        // const response = await api.get(`/auth-service/users/${userId}`);
        // return response.data;
        return { id: userId, email: 'mock@example.com', role: 'STUDENT', enabled: true };
    },

    /**
     * Create a new user Auth + Profile
     */
    createUser: async (userData: any): Promise<any> => {
        // API 1: Create Auth user (userId and email auto-generated by backend)
        const authPayload = {
            email: userData.email,
            password: userData.password,
            role: userData.role
        };
        const authResponse = await api.post('/auth-service/auth/register', authPayload);

        // Extract the securely generated userId from the backend response
        const generatedUserId = authResponse.data?.userId || authResponse.data?.id;

        // API 2: Create Profile
        let profilePath = '';
        let profilePayload: any = {
            userId: generatedUserId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber
        };

        if (userData.role === 'STUDENT') {
            profilePath = '/profile-service/profiles/students';
            profilePayload = {
                ...profilePayload,
                department: userData.department,
                yearOfStudy: parseInt(userData.yearOfStudy, 10),
                section: userData.section,
                parentName: userData.parentName,
                parentEmail: userData.parentEmail,
                parentPhone: userData.parentPhone
            };
        } else if (userData.role === 'WARDEN') {
            profilePath = '/profile-service/profiles/wardens';
            profilePayload = {
                ...profilePayload,
                hostelName: userData.hostelName
            };
        } else if (userData.role === 'SECURITY') {
            profilePath = '/profile-service/profiles/security';
            profilePayload = {
                ...profilePayload,
                gateName: userData.gateName
            };
        }

        if (profilePath && generatedUserId) {
            await api.post(profilePath, profilePayload);
        }

        return authResponse.data;
    },

    /**
     * Enable or Disable a user
     */
    toggleUserStatus: async (userId: string, enabled: boolean): Promise<void> => {
        await api.patch(`/auth-service/auth/users/${userId}/status`, { enabled });
    },

    /**
     * Update user details
     */
    updateUser: async (userId: string, userData: any): Promise<any> => {
        const skipHeader = { headers: { 'X-Skip-Auth-Redirect': 'true' } };
        // 1. Update Auth role
        await api.put(`/auth-service/auth/users/${userId}`, { role: userData.role }, skipHeader);

        // 2. Update Profile dynamically based on the final selected role
        let profilePayload: any = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
        };

        let profilePath = '';
        if (userData.role === 'STUDENT') {
            profilePath = `/profile-service/profiles/students/${userId}/admin`;
            profilePayload = {
                ...profilePayload,
                department: userData.department,
                yearOfStudy: parseInt(userData.yearOfStudy, 10),
                section: userData.section,
                parentName: userData.parentName,
                parentEmail: userData.parentEmail,
                parentPhone: userData.parentPhone
            };
        } else if (userData.role === 'WARDEN') {
            profilePath = `/profile-service/profiles/wardens/${userId}`;
            profilePayload = {
                ...profilePayload,
                hostelName: userData.hostelName
            };
        } else if (userData.role === 'SECURITY') {
            profilePath = `/profile-service/profiles/security/${userId}`;
            profilePayload = {
                ...profilePayload,
                gateName: userData.gateName
            };
        }

        if (profilePath) {
            await api.put(profilePath, profilePayload, skipHeader);
        }

        return userData;
    }
};
