import { useEffect, useState } from 'react';
import api from '../services/api';
export function useNotifications(){const [notifications,setNotifications]=useState([]);useEffect(()=>{api.get('/notifications').then(r=>setNotifications(r.data.notifications)).catch(()=>{});},[]);return notifications;}
