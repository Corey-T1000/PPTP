import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TrackElement } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Isometric projection matrix
const ISO_ANGLE = Math.PI / 6; // 30 degrees
const cos30 = Math.cos(ISO_ANGLE);
const sin30 = Math.sin(ISO_ANGLE);

export function toIsometric(x: number, y: number, z: number = 0): [number, number] {
  const isoX = (x - y) * cos30;
  const isoY = (x + y) * sin30 - z;
  return [isoX, isoY];
}

export function drawTrackElement(
  ctx: CanvasRenderingContext2D,
  element: TrackElement,
  isSelected: boolean,
  isIsometric: boolean
) {
  ctx.save();
  
  if (isIsometric) {
    // Apply isometric transformation
    const [isoX, isoY] = toIsometric(element.x, element.y);
    ctx.translate(ctx.canvas.width / 2 + isoX, ctx.canvas.height / 2 + isoY);
    ctx.scale(1, 0.5); // Flatten for isometric look
    ctx.rotate((element.rotation * Math.PI) / 180);
  } else {
    ctx.translate(element.x, element.y);
    ctx.rotate((element.rotation * Math.PI) / 180);
  }

  // Draw selection outline
  if (isSelected) {
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      -element.width / 2 - 5,
      -element.height / 2 - 5,
      element.width + 10,
      element.height + 10
    );

    // Draw control handles only in top-down view
    if (!isIsometric) {
      // Rotation handle
      ctx.beginPath();
      ctx.arc(0, -element.height / 2 - 20, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -element.height / 2);
      ctx.lineTo(0, -element.height / 2 - 15);
      ctx.strokeStyle = '#2563eb';
      ctx.stroke();

      // Resize handle
      ctx.beginPath();
      ctx.arc(element.width / 2, element.height / 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
    }
  }

  // Element-specific rendering
  switch (element.type) {
    case 'berm': {
      // Create gradient for 3D effect
      const gradient = ctx.createRadialGradient(
        0, 0, 0,
        0, 0, element.width / 2
      );
      gradient.addColorStop(0, '#4f46e5');
      gradient.addColorStop(1, '#312e81');
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(0, 0, element.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (isIsometric) {
        // Add height indication
        ctx.beginPath();
        ctx.ellipse(0, 0, element.width / 2, element.height / 4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#4338ca';
        ctx.stroke();
      }
      break;
    }
    case 'roller': {
      const height = isIsometric ? element.height / 2 : element.height;
      
      // Create gradient for 3D effect
      const gradient = ctx.createLinearGradient(
        -element.width / 2, -height / 2,
        element.width / 2, height / 2
      );
      gradient.addColorStop(0, '#4f46e5');
      gradient.addColorStop(1, '#312e81');
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;

      if (isIsometric) {
        // Draw 3D box
        ctx.beginPath();
        ctx.moveTo(-element.width / 2, -height / 2);
        ctx.lineTo(element.width / 2, -height / 2);
        ctx.lineTo(element.width / 2, height / 2);
        ctx.lineTo(-element.width / 2, height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Top face
        ctx.beginPath();
        ctx.ellipse(0, -height / 2, element.width / 2, height / 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#4338ca';
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(-element.width / 2, -height / 2, element.width, height);
        ctx.strokeRect(-element.width / 2, -height / 2, element.width, height);
      }
      break;
    }
    case 'tabletop': {
      const height = isIsometric ? element.height / 2 : element.height;
      
      // Create gradient for 3D effect
      const gradient = ctx.createLinearGradient(
        -element.width / 2, height / 2,
        element.width / 2, -height / 2
      );
      gradient.addColorStop(0, '#4f46e5');
      gradient.addColorStop(1, '#312e81');
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;

      if (isIsometric) {
        // Draw 3D trapezoid
        ctx.beginPath();
        ctx.moveTo(-element.width / 2, height / 2);
        ctx.lineTo(-element.width / 4, -height / 2);
        ctx.lineTo(element.width / 4, -height / 2);
        ctx.lineTo(element.width / 2, height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Top face
        ctx.beginPath();
        ctx.moveTo(-element.width / 4, -height / 2);
        ctx.lineTo(element.width / 4, -height / 2);
        ctx.lineTo(element.width / 3, -height / 2 + height / 4);
        ctx.lineTo(-element.width / 3, -height / 2 + height / 4);
        ctx.closePath();
        ctx.fillStyle = '#4338ca';
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(-element.width / 2, height / 2);
        ctx.lineTo(0, -height / 2);
        ctx.lineTo(element.width / 2, height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
  }

  ctx.restore();
}