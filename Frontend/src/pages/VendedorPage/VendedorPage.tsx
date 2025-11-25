import AppLayout from "../../components/Layout/AppLayout";
import VehicleList from "../../components/vehicles/VehicleList";

export default function VendedorPage() {
  return (
    <AppLayout>
      <VehicleList canManage />
    </AppLayout>
  );
}
