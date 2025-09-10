import { useState } from "react";
import { User } from "@/types";

export default function TestSnap() {
    return (
        <div>
            <script type="text/javascript"
            src="https://app.sandbox.midtrans.com/snap/snap.js"
            data-client-key="<CLIENT-KEY>"></script>
        </div>
    )
}
