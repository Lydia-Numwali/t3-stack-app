"use client";
/* eslint-disable @next/next/no-img-element */
import { ArrowRight3, ExportCircle, Receipt2, TickCircle } from "iconsax-react";
import {
  useEffect,

  useState,

} from "react";
import { createPortal } from "react-dom";
import {
  FormProvider,
  useForm,

  type SubmitHandler,
} from "react-hook-form";

import { BackButton } from "~/components/Buttons/BackButton";
import { DoneButton } from "~/components/Buttons/DoneButton";
import { PayNowButton } from "~/components/Buttons/PayNowButton";

import LabelId from "~/components/LabelId";
import OrderTrackingId from "~/components/OrderTrackingId";


import { useAuthContext } from "~/contexts/AuthContext";
import { type BillingDetailsType } from "~/contexts/AutoImportContext";
import { useShopContext, type ShopItemType } from "~/contexts/ShopContext";
import { useTabContext } from "~/contexts/TabContext";

import useMultiStepForm from "~/hooks/useMultistepForm";


import { usePaystackPayment } from "react-paystack";
import { useFetchShopRequestPrice } from "~/hooks/useFetchShopRequestPrice";
import { useUpdatePaymentStatus } from "~/hooks/useUpdatePaymentStatus";
import { stepsContentType } from "../Requests/RequestCheckout";

const RequestCheckout = () => {
  const [portal, setPortal] = useState<Element | DocumentFragment | null>(null);
  const {
    requestPackages,
    handleRequests,
    orderPackages,
    shopRequestTotalQuery,
  } = useShopContext();
  const { handleActiveAction, handleTabChange } = useTabContext();

  const { viewIndex } = useTabContext();

  if (viewIndex === null) return;

  const requestPackage = requestPackages?.[viewIndex];

  if (!requestPackage) return;

  const total = [
    +shopRequestTotalQuery?.data?.data?.totalUrgentPurchaseCost,
    +shopRequestTotalQuery?.data?.data?.totalItemCostFromStore,
    +shopRequestTotalQuery?.data?.data?.totalShippingToOriginWarehouse,
    +shopRequestTotalQuery?.data?.data?.totalProcessingFee,
    +shopRequestTotalQuery?.data?.data?.orderVat,
    +shopRequestTotalQuery?.data?.data?.orderPaymentMethodSurcharge,
    -+shopRequestTotalQuery?.data?.data?.orderDiscount,
  ].reduce((total, cost) => (total += cost || 0));

  const steps: [stepsContentType, ...stepsContentType[]] = [
    { title: "Package Confirmation", content: <PackageConfirmation /> },
    {
      title: "Shipping & Billing Details Confirmation",
      content: <BillingAddress />,
    },
    { title: "Place Order", content: <PlaceOrder /> },
    { title: "Success", content: <Success /> },
  ];
  const stepsContent = steps.map((step) => step.content);
  const {
    step,
    currentStepIndex,
    next,
    isFirstStep,
    back,
    isLastStep,
    isSecondToLastStep,
  } = useMultiStepForm(stepsContent);
  const currentTitle = steps[currentStepIndex]?.title ?? "";

  const formMethods = useForm<RequestCheckoutInputs>({
    defaultValues: emptyValue,
  });

  const initializePayment = usePaystackPayment({
    reference: new Date().getTime().toString(),
    publicKey: "pk_test_deebbde4eab19e1f1dd98af8f68c04553d379249",
  });
  const { updatePaymentStatus } = useUpdatePaymentStatus();

  const successPayment = (transaction) => {
    updatePaymentStatus.mutate(
      {
        refId: transaction.reference,
        orderId: requestPackage.id,
      },
      {
        onSuccess: () => {
          next();
        },
        onError: () => {
          alert("An error occurred while updating payment status");
        },
      },
    );
  };

  const cancelPayment = () => {
    alert("Are your sure you want payment cancel");
  };

  const onSubmit: SubmitHandler<RequestCheckoutInputs> = async (data) => {
    if (isSecondToLastStep) {
      const config = {
        reference: new Date().getTime().toString(),
        amount: total * 120000,
        email: data.billingDetails.email,
        firstname: data.billingDetails.firstName,
        lastname: data.billingDetails.lastName,
        publicKey: "pk_test_deebbde4eab19e1f1dd98af8f68c04553d379249",
      };

      initializePayment({
        onSuccess: successPayment,
        onClose: cancelPayment,
        config: config,
      });
    } else {
      next();
    }
  };

  const handleBack = () => {
    handleActiveAction(null);
  };

  const handleFinish = () => {
    handleRequests();
    handleTabChange("orders");
  };

  useEffect(() => {
    setPortal(document.getElementById("payNowButton"));
  }, [step]);

  return (
    <FormProvider {...formMethods}>
      <div className="flex max-w-[1032px] flex-col gap-[30px] rounded-[20px] bg-white p-[20px] md:p-[30px]">
        <RequestFormHeader title="Confirm and Place your Order" />

        <StepIndex
          currentIndex={currentStepIndex}
          length={steps.length}
          title={currentTitle}
        />

        {!isLastStep ? (
          <LabelId label="Request ID" id={requestPackage.requestId} />
        ) : (
          // todo: fetch orderPackage of the requestPackage.requestId to get orderId and trackingId
          <SectionContentLayout>
            <OrderTrackingId orderId="OD78667" trackingId="SH78667" center />
          </SectionContentLayout>
        )}

        {step}

        <div className="flex w-full flex-col items-center justify-center gap-[10px] md:w-max md:flex-row">
          {isFirstStep && (
            <div className="w-full md:max-w-[210px]">
              <BackButton onClick={handleBack} />
            </div>
          )}
          {!isFirstStep && !isLastStep && (
            <div className="w-full md:max-w-[210px]">
              <BackButton onClick={back} />
            </div>
          )}
          {currentStepIndex === 0 && (
            <DoneButton
              text="Proceed"
              onClick={formMethods.handleSubmit(onSubmit)}
            />
          )}
          {currentStepIndex === 1 && (
            <DoneButton
              text="Confirm"
              onClick={formMethods.handleSubmit(onSubmit)}
            />
          )}
          {currentStepIndex === 3 && (
            <div className="w-full">
              <DoneButton text="Done" onClick={handleFinish} />
            </div>
          )}
        </div>

        {portal &&
          createPortal(
            <PayNowButton onClick={formMethods.handleSubmit(onSubmit)} />,
            portal,
          )}
      </div>
    </FormProvider>
  );
};