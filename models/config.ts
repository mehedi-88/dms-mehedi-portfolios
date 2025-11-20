export interface ModelConfig {
  [key: string]: {
    path: string;
    name: string;
    description: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    animation?: string;
  };
}

export const modelConfig: ModelConfig = {
  '/': {
    path: '/models/robot_scan.glb',
    name: 'Futuristic Robot',
    description: 'Humanoid robot performing scanning animation',
    scale: 1.2,
    position: [0, -1, 0],
    rotation: [0, 0, 0],
    animation: 'scan'
  },
  '/about': {
    path: '/models/ai_brain.glb',
    name: 'AI Brain',
    description: 'Floating holographic AI brain interface',
    scale: 0.8,
    position: [0, 0, 0],
    rotation: [0, Math.PI / 4, 0],
    animation: 'pulse'
  },
  '/projects': {
    path: '/models/robotic_arms.glb',
    name: 'Robotic Arms',
    description: 'Mechanical arms building holographic projections',
    scale: 1.0,
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
    animation: 'build'
  },
  '/services': {
    path: '/models/data_bot.glb',
    name: 'Data Bot',
    description: 'AI bot projecting data grids and analytics',
    scale: 0.9,
    position: [0, -0.8, 0],
    rotation: [0, -Math.PI / 6, 0],
    animation: 'project'
  },
  '/contact': {
    path: '/models/assistant.glb',
    name: 'Assistant Bot',
    description: 'Friendly robotic assistant extending hand gesture',
    scale: 1.1,
    position: [0, -1.2, 0],
    rotation: [0, Math.PI / 3, 0],
    animation: 'greet'
  },
  '/admin': {
    path: '/models/security_bot.glb',
    name: 'Security Bot',
    description: 'Advanced security and monitoring robot',
    scale: 1.0,
    position: [0, -1, 0],
    rotation: [0, 0, 0],
    animation: 'monitor'
  },
  '/admin-chat': {
    path: '/models/comms_bot.glb',
    name: 'Communications Bot',
    description: 'Advanced communication and chat interface robot',
    scale: 0.95,
    position: [0, -0.7, 0],
    rotation: [0, Math.PI / 2, 0],
    animation: 'communicate'
  },
  '/dms-ai-powered': {
    path: '/models/ai_core.glb',
    name: 'AI Core',
    description: 'Central AI processing core with neural networks',
    scale: 0.85,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animation: 'process'
  },
  '/faq': {
    path: '/models/info_bot.glb',
    name: 'Information Bot',
    description: 'Helpful information and FAQ assistant robot',
    scale: 1.0,
    position: [0, -1, 0],
    rotation: [0, -Math.PI / 4, 0],
    animation: 'assist'
  }
};

export const getModelForPath = (pathname: string) => {
  // Exact match first
  if (modelConfig[pathname]) {
    return modelConfig[pathname];
  }

  // Fallback to root for unknown paths
  return modelConfig['/'];
};

export const defaultModelConfig = {
  scale: 1.0,
  position: [0, 0, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  animation: 'idle'
};