import FeatureForm from "@/components/FeatureForm";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export default function page() {
  return (
    <section
      id="main-page"
      className="flex flex-col justify-center size-full items-center gap-8 my-8"
    >

      <div className="px-6 sm:px-16 max-w-screen-xl mx-auto size-full">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Feature</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <FeatureForm />
      </div>
    </section>
  );
}
