# Reglas Técnicas del Proyecto

- No asumas nada si no te lo digo explicitamente
- No cambies nada si no estas 100% seguro

## Backend (NestJS + MongoDB)

### Estructura de Carpetas

```
Backend/
├── src/
│   ├── [module]/
│   │   ├── dto/
│   │   │   ├── create-[entity].dto.ts
│   │   │   └── update-[entity].dto.ts
│   │   ├── entities/
│   │   │   └── [entity].entity.ts
│   │   ├── [module].controller.ts
│   │   ├── [module].service.ts
│   │   └── [module].module.ts
│   ├── auth/
│   ├── users/
│   └── main.ts

```

### Patrones y Convenciones

#### Entidades (Mongoose)

- Usar decoradores `@Schema` y `@Prop`
- Incluir timestamps automáticos
- Definir tipos de documento con `Document`
- Usar referencias con `MongooseSchema.Types.ObjectId`
- Ejemplo:

```typescript
@Schema({ timestamps: true })
export class Entity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "RelatedEntity" })
  relatedId: RelatedEntity;
}
```

#### DTOs

- Usar class-validator para validaciones
- Separar DTOs por operación (create, update)
- Usar tipos específicos de MongoDB cuando sea necesario
- Ejemplo:

```typescript
export class CreateDto {
  @IsMongoId()
  relatedId: Types.ObjectId;
}
```

#### Servicios

- Inyectar modelos con `@InjectModel`
- Usar populate para referencias
- Manejar errores con excepciones de NestJS
- Ejemplo:

```typescript
@Injectable()
export class Service {
  constructor(@InjectModel(Entity.name) private model: Model<EntityDocument>) {}
}
```

#### Controladores

- Usar decoradores de NestJS para rutas
- Implementar autenticación con `@UseGuards`
- Ejemplo:

```typescript
@Controller("resource")
@UseGuards(JwtAuthGuard)
export class Controller {
  @Get()
  findAll() {}
}
```

### Validaciones

- Usar class-validator para DTOs
- Implementar validaciones personalizadas cuando sea necesario
- Manejar errores con excepciones HTTP apropiadas

### Autenticación

- Usar JWT para autenticación
- Implementar guards para rutas protegidas
- Manejar roles y permisos

## Frontend (React + TypeScript)

### Estructura de Carpetas

```
Frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── [feature]/
│   ├── pages/
│   ├── models/
│   └── utils/
```

### Patrones y Convenciones

#### Componentes

- Usar componentes funcionales con hooks
- Implementar TypeScript para tipos
- Separar lógica de presentación
- Ejemplo:

```typescript
interface Props {
  data: Entity;
}

const Component: React.FC<Props> = ({ data }) => {
  return <div>{data.name}</div>;
};
```

#### Modelos

- Definir interfaces para tipos de datos
- Usar tipos de MongoDB cuando sea necesario
- Ejemplo:

```typescript
export interface Entity {
  _id: string;
  name: string;
}
```

#### API

- Usar hooks personalizados para llamadas API
- Manejar estados de carga y error
- Implementar caché cuando sea necesario
- Ejemplo:

```typescript
const useEntity = (id: string) => {
  const [data, setData] = useState<Entity>();
  const [loading, setLoading] = useState(true);
  // ...
};
```

### Estado Global

- Usar Context API para estado global
- Implementar reducers para lógica compleja
- Mantener estado local cuando sea posible

### Estilos

- Usar Tailwind CSS
- Implementar diseño responsive
- Mantener consistencia en la UI

## Base de Datos (MongoDB)

### Esquemas

- Usar referencias para relaciones
- Implementar índices cuando sea necesario
- Mantener consistencia en nombres de campos

### Consultas

- Usar agregaciones para consultas complejas
- Implementar paginación
