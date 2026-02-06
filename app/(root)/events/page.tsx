"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { App, Empty } from "antd";
import { getEvents, type EventResponse } from "@/lib/api/events";
import EventCard from "@/app/components/events/EventCard";
import EventDetailModal, { type EventDetail } from "@/app/components/events/EventDetailModal";
import DarkPagination from "@/app/components/common/DarkPagination";
import EventsSkeleton from "@/app/components/events/EventsSkeleton";
import CustomInput from "@/app/components/common/CustomInput";
import CustomSelect from "@/app/components/common/CustomSelect";

export default function EventsPage() {
  const { message } = App.useApp();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const pageSize = 18;
  const abortControllerRef = useRef<AbortController | null>(null);
  const pageChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setEvents([]); // Clear events to prevent overlap

      const result = await getEvents(
        {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearchText || undefined,
        },
        { signal: controller.signal }
      );

      // Only update state if request wasn't aborted
      if (!controller.signal.aborted) {
        setEvents(result.events);
        setTotal(result.total);
      }
    } catch (error: unknown) {
      // Don't show error for aborted requests
      if (error instanceof Error && error.name !== "AbortError" && !controller.signal.aborted) {
        message.error(error.message || "Không thể tải danh sách sự kiện");
      }
    } finally {
      // Only update loading state if request wasn't aborted
      if (!controller.signal.aborted) {
        setLoading(false);
        // Reset isChangingPage flag when request completes
        setIsChangingPage(false);
        // Clear timeout if exists
        if (pageChangeTimeoutRef.current) {
          clearTimeout(pageChangeTimeoutRef.current);
          pageChangeTimeoutRef.current = null;
        }
      }
    }
  }, [currentPage, debouncedSearchText, message]);

  useEffect(() => {
    fetchEvents();

    // Cleanup: abort request when component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Cleanup page change timeout
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current);
        pageChangeTimeoutRef.current = null;
      }
    };
  }, [fetchEvents]);

  // Get event status
  const getEventStatus = (startDate: string, endDate: string): { status: string; color: string } => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { status: "Sắp diễn ra", color: "blue" };
    } else if (now >= start && now <= end) {
      return { status: "Đang diễn ra", color: "green" };
    } else {
      return { status: "Đã kết thúc", color: "gray" };
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time range
  const formatTimeRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startTime = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const endTime = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return `${startTime} - ${endTime}`;
  };

  // Map event to detail format
  const mapEventToDetail = (event: EventResponse): EventDetail => {
    const { status, color } = getEventStatus(event.start_event_date, event.end_event_date);
    return {
      id: event.event_id,
      title: event.title,
      date: formatDate(event.start_event_date),
      time: formatTimeRange(event.start_event_date, event.end_event_date),
      location: event.location,
      status,
      color,
      description: event.description,
      organizer: event.creator?.fullname || event.creator?.username || "N/A",
      participants: "", // Not provided by API
    };
  };

  // Filter events by status (client-side filtering if needed)
  const filteredEvents = useMemo(() => {
    if (!selectedStatus) return events;

    return events.filter((event) => {
      const { status } = getEventStatus(event.start_event_date, event.end_event_date);
      if (selectedStatus === "upcoming") return status === "Sắp diễn ra";
      if (selectedStatus === "ongoing") return status === "Đang diễn ra";
      if (selectedStatus === "finished") return status === "Đã kết thúc";
      return true;
    });
  }, [events, selectedStatus]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  // Handle status change
  const handleStatusChange = (value: string | undefined) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  // Handle card click
  const handleCardClick = (event: EventResponse) => {
    const eventDetail = mapEventToDetail(event);
    setSelectedEvent(eventDetail);
    setIsModalOpen(true);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    // Prevent double click / rapid page changes
    if (isChangingPage) {
      return;
    }

    // Don't change if it's the same page
    if (page === currentPage) {
      return;
    }

    // Clear any existing timeout
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current);
      pageChangeTimeoutRef.current = null;
    }

    setIsChangingPage(true);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fallback: Reset flag after timeout if request takes too long
    // But normally it will be reset in fetchEvents finally block
    pageChangeTimeoutRef.current = setTimeout(() => {
      setIsChangingPage(false);
      pageChangeTimeoutRef.current = null;
    }, 2000); // Increased timeout as fallback
  };

  return (
    <App>
      <main className="h-full bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Sự kiện</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto transition-colors duration-300">
              Khám phá các sự kiện sắp diễn ra và đang diễn ra
            </p>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-6"></div>
          </div>

          {/* Search & Filter Section */}
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <CustomInput
                placeholder="Tìm kiếm sự kiện..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                wrapperClassName="flex-1 w-full"
              />
              <CustomSelect
                placeholder="Lọc theo trạng thái"
                value={selectedStatus}
                onChange={handleStatusChange}
                options={[
                  { label: "Sắp diễn ra", value: "upcoming" },
                  { label: "Đang diễn ra", value: "ongoing" },
                  { label: "Đã kết thúc", value: "finished" },
                ]}
                wrapperClassName="w-full md:w-64"
                allowClear
              />
            </div>
          </div>

          {loading ? (
            <EventsSkeleton />
          ) : filteredEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event: EventResponse) => {
                  const { status, color } = getEventStatus(event.start_event_date, event.end_event_date);
                  return (
                    <EventCard
                      key={event.event_id}
                      id={event.event_id}
                      title={event.title}
                      date={formatDate(event.start_event_date)}
                      time={formatTimeRange(event.start_event_date, event.end_event_date)}
                      location={event.location}
                      status={status}
                      color={color}
                      onDetailClick={() => handleCardClick(event)}
                    />
                  );
                })}
              </div>

              {total > pageSize && (
                <DarkPagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showTotal={(total, range) => (
                    <span className="text-slate-500 dark:text-slate-300">
                      {range[0]}-{range[1]} của {total} sự kiện
                    </span>
                  )}
                  className="mt-12"
                />
              )}
            </>
          ) : (
            <div className="py-20 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 transition-colors duration-300 shadow-sm">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-slate-500 dark:text-slate-400 text-lg">Không tìm thấy sự kiện nào</span>} />
            </div>
          )}
        </div>
      </main>

      {/* Event Detail Modal */}
      <EventDetailModal
        open={isModalOpen}
        event={selectedEvent}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
      />
    </App>
  );
}
