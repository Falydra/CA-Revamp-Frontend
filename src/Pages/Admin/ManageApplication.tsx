import { useEffect, useState } from "react";
import AdminLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { OrganizerApplication } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { toast } from "sonner";
import { Search, Eye, Check, X, Loader2 } from "lucide-react";

export default function ManageApplication() {
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    OrganizerApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedApplication, setSelectedApplication] =
    useState<OrganizerApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  const fetchApplications = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getOrganizerApplications(page, 10);

      if (response.data) {
        const applicationList = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        setApplications(applicationList);
        setFilteredApplications(applicationList);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || 1);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1);
  }, []);

  useEffect(() => {
    let filtered = applications;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (app) =>
          app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const handleViewApplication = (application: OrganizerApplication) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (
    applicationId: string,
    status: "approved" | "rejected",
    notes?: string
  ) => {
    try {
      setProcessingAction(true);

      let response;
      if (status === "approved") {
        response = await apiService.approveOrganizerApplication(applicationId);
      } else {
        response = await apiService.rejectOrganizerApplication(
          applicationId,
          notes
        );
      }

      if (response.data?.success !== false) {
        toast.success(`Application ${status} successfully!`);
        setIsModalOpen(false);
        setSelectedApplication(null);
        fetchApplications(currentPage);
      } else {
        toast.error(`Failed to ${status} application`);
      }
    } catch (error: any) {
      console.error(`Error ${status} application:`, error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${status} application`);
      }
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const handlePageChange = (page: number) => {
    fetchApplications(page);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading applications...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Applications</h1>
            <p className="text-muted-foreground">
              Review and manage organizer applications
            </p>
          </div>
          <Button onClick={() => fetchApplications(currentPage)}>
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, NIK, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {applications.length === 0
                    ? "No applications found"
                    : "No applications match your search"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Applicant</th>
                      <th className="text-left p-4 font-medium">NIK</th>
                      <th className="text-left p-4 font-medium">Phone</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Applied</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr
                        key={application.application_id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium">
                              {application.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {application.user?.email || "No email"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">{application.nik}</td>
                        <td className="p-4">{application.phone_number}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusText(application.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {application.created_at
                            ? new Date(
                                application.created_at
                              ).toLocaleDateString("id-ID")
                            : "N/A"}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Application Review - {selectedApplication?.full_name}
              </DialogTitle>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {getStatusText(selectedApplication.status)}
                  </Badge>
                  {selectedApplication.reviewed_at && (
                    <p className="text-sm text-muted-foreground">
                      Reviewed:{" "}
                      {new Date(
                        selectedApplication.reviewed_at
                      ).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Full Name
                      </p>
                      <p className="font-medium">
                        {selectedApplication.full_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        NIK
                      </p>
                      <p>{selectedApplication.nik}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </p>
                      <p>{selectedApplication.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Gender
                      </p>
                      <p className="capitalize">{selectedApplication.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </p>
                      <p>
                        {new Date(
                          selectedApplication.date_of_birth
                        ).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p>{selectedApplication.user?.email || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Detail Address
                      </p>
                      <p>{selectedApplication.address_detail}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          RT/RW
                        </p>
                        <p>
                          RT {selectedApplication.rt}/RW{" "}
                          {selectedApplication.rw}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Kelurahan
                        </p>
                        <p>{selectedApplication.kelurahan}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Kecamatan
                        </p>
                        <p>{selectedApplication.kecamatan}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          City
                        </p>
                        <p>{selectedApplication.city}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Province
                        </p>
                        <p>{selectedApplication.province}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Postal Code
                        </p>
                        <p>{selectedApplication.postal_code}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedApplication.id_card_image && (
                  <Card>
                    <CardHeader>
                      <CardTitle>ID Card Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={
                          selectedApplication.id_card_image.startsWith("http")
                            ? selectedApplication.id_card_image
                            : `http://localhost:8000/storage/${selectedApplication.id_card_image}`
                        }
                        alt="ID Card"
                        className="max-w-full h-auto rounded-lg border shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = "/images/placeholder.png";
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Application History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Applied:</span>
                      <span className="text-sm">
                        {selectedApplication.created_at
                          ? new Date(
                              selectedApplication.created_at
                            ).toLocaleString("id-ID")
                          : "N/A"}
                      </span>
                    </div>
                    {selectedApplication.updated_at &&
                      selectedApplication.updated_at !==
                        selectedApplication.created_at && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            Last Updated:
                          </span>
                          <span className="text-sm">
                            {new Date(
                              selectedApplication.updated_at
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    {selectedApplication.reviewed_at && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Reviewed:</span>
                        <span className="text-sm">
                          {new Date(
                            selectedApplication.reviewed_at
                          ).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedApplication.status === "pending" && (
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApplication.application_id,
                          "rejected"
                        )
                      }
                      disabled={processingAction}
                    >
                      {processingAction ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject Application
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApplication.application_id,
                          "approved"
                        )
                      }
                      disabled={processingAction}
                    >
                      {processingAction ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve Application
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
