import { motion } from 'framer-motion';
import { 
  Leaf, 
  Droplets, 
  Sun, 
  Thermometer,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Plant } from '@/types/greenhouse';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import vegetablesImg from '@/assets/vegetables-fresh.jpg';
import fruitsImg from '@/assets/fruits-berries.jpg';
import seedlingImg from '@/assets/seedling-growth.jpg';

interface PlantCardProps {
  plant: Plant;
}

const healthColors = {
  excellent: 'text-success bg-success/10 border-success/30',
  good: 'text-primary bg-primary/10 border-primary/30',
  fair: 'text-warning bg-warning/10 border-warning/30',
  poor: 'text-destructive bg-destructive/10 border-destructive/30',
};

const PlantCard = ({ plant }: PlantCardProps) => {
  const daysToHarvest = Math.ceil(
    (new Date(plant.expectedHarvest).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  const getPlantImage = () => {
    switch (plant.type) {
      case 'vegetable': return vegetablesImg;
      case 'fruit': return fruitsImg;
      default: return seedlingImg;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-card-hover overflow-hidden"
    >
      {/* Plant Image */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={getPlantImage()} 
          alt={plant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        {/* Health badge */}
        <Badge 
          className={cn(
            "absolute top-3 right-3",
            healthColors[plant.health]
          )}
        >
          {plant.health}
        </Badge>
        
        {/* Zone */}
        <span className="absolute top-3 left-3 px-2 py-1 bg-background/80 rounded text-xs font-medium">
          {plant.zone}
        </span>
      </div>
      
      <div className="p-5">
        <div className="mb-4">
          <h4 className="text-lg font-display font-bold">{plant.name}</h4>
          <p className="text-sm text-muted-foreground">{plant.variety}</p>
        </div>
        
        {/* Growth progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              Growth
            </span>
            <span className="font-medium text-primary">{plant.growthStage}%</span>
          </div>
          <Progress value={plant.growthStage} className="h-2" />
        </div>
        
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-humidity" />
            <span className="text-muted-foreground truncate">{plant.wateringSchedule}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-light" />
            <span className="text-muted-foreground">{plant.lightRequirement}</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-temperature" />
            <span className="text-muted-foreground">{plant.temperatureRange.min}-{plant.temperatureRange.max}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {daysToHarvest > 0 ? `${daysToHarvest}d to harvest` : 'Ready!'}
            </span>
          </div>
        </div>
        
        {/* Planted date */}
        <div className="mt-4 pt-4 border-t border-glass-border text-xs text-muted-foreground">
          Planted: {new Date(plant.plantedDate).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

export default PlantCard;
